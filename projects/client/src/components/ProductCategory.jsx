import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../helper'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { updateCart } from '../action/useraction';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const ProductCategory = (props) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [productByCategory, setProductByCategory] = useState([])
    const [userCartData, setUserCartData] = React.useState([]);
    let { iduser, status } = useSelector((state) => {
        return {
            iduser: state.userReducer.iduser,
            status: state.userReducer.status_name,
        }
    })

    console.log(props)

    const getCategoryProduct = () => {
        axios.post(API_URL + `/api/product/getproductadmin?${props.id}`, {
            limit: 5,
            sort: '',
            offset: ''
        })
            .then((res) => {
                setProductByCategory(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
            .then((res) => {
                console.log(res.data)
                setProductByCategory(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    useEffect(() => {
        getCategoryProduct();
        let userToken = localStorage.getItem('medcarelog');
        if (userToken !== null) {
            getUserCartData();
        }
    }, []);

    // kemal add to cart APKG2-26
    const getUserCartData = async () => {
        try {
            let userToken = localStorage.getItem('medcarelog');
            let get = await axios.get(API_URL + '/api/product/getcartdata', {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            console.log('user cart', get.data);
            setUserCartData(get.data);
            dispatch(updateCart(get.data));
        } catch (error) {
            console.log(error)
        }
    };


    // kemal add to cart APKG2-26
    const onAddToCart = async (id) => {

        if (iduser) {
            if (status === 'Verified') {
                try {

                    let userToken = localStorage.getItem('medcarelog');
                    let findIndex = userCartData.find(val => val.idproduct === id);


                    if (findIndex === undefined) {
                        console.log(true);

                        let data = {
                            idproduct: id,
                            newQty: 1
                        };

                        let res = await axios.post(API_URL + '/api/product/addcart', data, {
                            headers: {
                                'Authorization': `Bearer ${userToken}`
                            }
                        });


                        if (res.data.success) {
                            toast.success('Item Added to Cart', {
                                theme: "colored",
                                position: "top-center",
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: false,
                                progress: undefined,
                            });
                            getUserCartData();
                        }
                    } else {
                        let data = {
                            idcart: findIndex.idcart,
                            newQty: findIndex.quantity + 1
                        };

                        let res = await axios.patch(API_URL + '/api/product/updatecart', data, {
                            headers: {
                                'Authorization': `Bearer ${userToken}`
                            }
                        });

                        if (res.data.success) {
                            toast.success('Item Added to Cart', {
                                theme: "colored",
                                position: "top-center",
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: false,
                                progress: undefined,
                            });
                            getUserCartData();
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            } else {
                toast.info('Verified your account first', {
                    theme: "colored",
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: false,
                    progress: undefined,
                });
            }
        } else {
            toast.info('You need to login first', {
                theme: "colored",
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
            });
        }
    };

    const printData = () => {
        return productByCategory.map((val, idx) => {
            return (
                <div className='w-48 h-80 shadow-lg mx-4 my-4 bg-white grid-cols-3' key={val.idproduct} >
                    <Link to={`/product/detail?product_name=${val.product_name}&category_id=${val.category_id}`}>
                        <div >
                            <div className='flex justify-center'>
                                <img src={val.picture} alt='medcare.com' className='w-64 h-36 px-10' />
                            </div>
                            <div className='py-5 h-28'>
                                <p className=' px-5 text-blue-900 font-bold text-sm font-Public'>{val.product_name}</p>
                                <div className='w-20 py-1 px-5 flex '>
                                    <p className='border border-red-400 text-xs text-red-300 font-bold text-center font-Public'>17%</p>
                                    <p className='pl-1 text-gray-400 text-xs line-through font-Public'>Rp.6.000</p>
                                </div>
                                <div className='px-5'>
                                    <p className='text-blue-900 font-bold text-sm'>Rp.{val.price.toLocaleString('id')}<span className='text-sm text-gray-400 font-normal font-Public'>/{val.netto_unit}</span></p>
                                </div>
                            </div>
                        </div>
                    </Link >
                    <div className='px-5 py-5'>
                        <button type='button' className='border-2 border-teal-500 text-teal-500 px-10 rounded-lg py-1 hover:bg-teal-200 font-Public'
                            onClick={() => onAddToCart(val.idproduct)}>Keranjang</button>
                    </div>
                </div >

            )
        })
    }

    return (
        <div className=''>
            <div className='overflow-x-auto w-full'>
                <div className=' flex'>
                    {printData()}
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default ProductCategory