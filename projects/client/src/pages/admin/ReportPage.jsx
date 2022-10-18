import React from 'react'
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto'
import axios from 'axios'
import { API_URL } from '../../helper';
import AdminComponent from '../../components/AdminComponent'
import Loading from '../../components/Loading'
import Currency from '../../components/CurrencyComp';
import { IoIosArrowDown, IoIosArrowRoundForward } from "react-icons/io";

const ReportPage = () => {
    const monthNames = ["Jan", "Feb", "March", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const [loading, setLoading] = React.useState(true)
    const [allReport, setAllReport] = React.useState('')
    const [revenueReport, setRevenueReport] = React.useState('')
    const [revenueSalesReport, setRevenueSalesReport] = React.useState('')
    const [transactionReport, setTransactionReport] = React.useState('')
    const [transactionSalesReport, setTransactionSalesReport] = React.useState('')
    const [userReport, setUserReport] = React.useState('')
    const [userSalesReport, setUserSalesReport] = React.useState('')
    const [productReport, setProductReport] = React.useState('')
    const [totalRevenue, setTotalRevenue] = React.useState(0)
    const [totalProduct, setTotalProduct] = React.useState(0)
    const [month, setMonth] = React.useState(`${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`)
    const [listMonth, setListMonth] = React.useState('')
    const [drop, setDrop] = React.useState(true)
    const [dropSort, setDropSort] = React.useState(true)
    const [sort, setSort] = React.useState('Date')
    const [dropStartRev, setDropStartRev] = React.useState(true)
    const [dropEndRev, setDropEndRev] = React.useState(true)
    const [startRevenue, setStartRevenue] = React.useState('Start Month')
    const [endRevenue, setEndRevenue] = React.useState('End Month')
    const [filterRev, setFilterRev] = React.useState(false)
    let indexStartRev = -1
    let indexEndRev = -1


    const options = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        layout: {
            padding: 20
        },
        elements: {
            line: {
                fill: true,
                borderColor: 'teal'
            }
        }
    }

    const getReport = (month, reset) => {
        axios.get(API_URL + `/api/transaction/report?month=${month}`)
            .then((res) => {
                setAllReport(res.data)
                let total_revenue = 0
                let total_product = 0
                setListMonth(res.data.revenue.map((val) => val.month))
                if (filterRev && !reset) {
                    handleFilterRev(sort)
                } else {
                    let revenueArray = res.data.revenue.slice(-12)
                    let revenueSalesArray = res.data.revenueSales.slice(0, 12)
                    let transactionArray = res.data.transaction.slice(-12)
                    let transactionSalesArray = res.data.transactionSales.slice(0, 12)
                    let userArray = res.data.user.slice(-12)
                    let userSalesArray = res.data.userSales.slice(0, 12)
                    setRevenueReport({
                        labels: revenueArray.map((val) => val.month),
                        datasets: [{
                            label: "Revenue",
                            data: revenueArray.map((val) => val.revenue),
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.2)'
                            ]
                        }]
                    })
                    setRevenueSalesReport({
                        labels: revenueSalesArray.map((val, idx) => val.month),
                        datasets: [{
                            label: "Revenue",
                            data: revenueSalesArray.map((val, idx) => val.revenue),
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.2)'
                            ]
                        }]
                    })
                    setProductReport({
                        labels: res.data.product.map((val) => val.product_name),
                        datasets: [{
                            label: "Best Seller",
                            data: res.data.product.map((val) => val.best_seller),
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.2)'
                            ]
                        }]
                    })
                    setTransactionReport({
                        labels: transactionArray.map((val) => val.month),
                        datasets: [{
                            label: "Transaction",
                            data: transactionArray.map((val) => val.transaction),
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.2)'
                            ]
                        }]
                    })
                    setTransactionSalesReport({
                        labels: transactionSalesArray.map((val) => val.month),
                        datasets: [{
                            label: "Transaction",
                            data: transactionSalesArray.map((val) => val.transaction),
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.2)'
                            ]
                        }]
                    })
                    setUserReport({
                        labels: userArray.map((val) => val.month),
                        datasets: [{
                            label: "User",
                            data: userArray.map((val) => val.user),
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.2)'
                            ]
                        }]
                    })
                    setUserSalesReport({
                        labels: userSalesArray.map((val) => val.month),
                        datasets: [{
                            label: "User",
                            data: userSalesArray.map((val) => val.user),
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.2)'
                            ]
                        }]
                    })
                }
                res.data.revenue.map((val) => {
                    total_revenue = total_revenue + val.revenue
                })
                res.data.product.map((val) => {
                    total_product = total_product + val.best_seller
                })
                setTotalRevenue(total_revenue / res.data.revenue.length)
                setTotalProduct(total_product)
                setTimeout(() => setLoading(false), 1000)
            }).catch((err) => {
                console.log(err)
            })
    }

    React.useEffect(() => {
        getReport(month)
    }, [])

    const handleFilterRev = (sort) => {
        setFilterRev(true)
        if (startRevenue != 'Start Month' && endRevenue != 'End Month') {
            if (sort == 'Date') {
                let indexStart = allReport.revenue.findIndex((val) => val.month == startRevenue)
                let indexEnd = allReport.revenue.findIndex((val) => val.month == endRevenue)
                let revenueArray = allReport.revenue.slice(indexStart, indexEnd + 1)
                let transactionArray = allReport.transaction.slice(indexStart, indexEnd + 1)
                let userArray = allReport.user.slice(indexStart, indexEnd + 1)
                setRevenueReport({
                    labels: revenueArray.map((val) => val.month),
                    datasets: [{
                        label: "Revenue",
                        data: revenueArray.map((val) => val.revenue),
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)'
                        ]
                    }]
                })
                setTransactionReport({
                    labels: transactionArray.map((val) => val.month),
                    datasets: [{
                        label: "Transaction",
                        data: transactionArray.map((val) => val.transaction),
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)'
                        ]
                    }]
                })
                setUserReport({
                    labels: userArray.map((val) => val.month),
                    datasets: [{
                        label: "User",
                        data: userArray.map((val) => val.user),
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)'
                        ]
                    }]
                })
            } else {
                let indexStart = listMonth.findIndex((val) => val == startRevenue)
                let indexEnd = listMonth.findIndex((val) => val == endRevenue)
                let filterMonth = listMonth.slice(indexStart, indexEnd + 1)
                let revenueSalesArray = allReport.revenueSales.filter((val) => filterMonth.includes(val.month))
                let transactionSalesArray = allReport.transactionSales.filter((val) => filterMonth.includes(val.month))
                let userSalesArray = allReport.userSales.filter((val) => filterMonth.includes(val.month))
                setRevenueSalesReport({
                    labels: revenueSalesArray.map((val) => val.month),
                    datasets: [{
                        label: "Revenue",
                        data: revenueSalesArray.map((val) => val.revenue),
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)'
                        ]
                    }]
                })
                setTransactionSalesReport({
                    labels: transactionSalesArray.map((val) => val.month),
                    datasets: [{
                        label: "Transaction",
                        data: transactionSalesArray.map((val) => val.transaction),
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)'
                        ]
                    }]
                })
                setUserSalesReport({
                    labels: userSalesArray.map((val) => val.month),
                    datasets: [{
                        label: "User",
                        data: userSalesArray.map((val) => val.user),
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)'
                        ]
                    }]
                })
            }
        }
    }

    return (<div >
        {loading ?
            <Loading loading={loading} />
            :
            <div>
                <div className='flex'>
                    <AdminComponent page={window.location.pathname} />
                    <div className='w-screen' style={{ background: "linear-gradient(155.7deg, #D6F5F3 -46%, #F7FCFC 100%, #F1F5FC 118%)" }}>
                        <div className='ml-5'>
                            <p className="sm:text-2xl font-bold mt-5 mb-3 text-txt-500">Report</p>
                        </div>
                        <div className='flex justify-center mb-10'>
                            <div className='inline'>
                                <button onClick={() => setDropStartRev(!dropStartRev)} id="dropdownDefault" data-dropdown-toggle="dropdown"
                                    className="border border-main-500 rounded-lg bg-white hover:bg-gray-400 hover:text-white font-thin w-32 mr-3 pl-2 mt-5 h-5 sm:h-10 text-center inline-flex items-center" type="button">
                                    {startRevenue}
                                </button>
                                {/* <!-- Dropdown menu --> */}
                                <p className='hidden'>{endRevenue == 'End Month' ? '' : indexStartRev = listMonth.findIndex((val) => val == endRevenue)}</p>
                                <div id="dropdown" className={`${dropStartRev == true ? 'hidden' : 'z-10 w-32 h-40 overflow-hide-accept bg-white rounded divide-y divide-gray-100 shadow absolute'}`} >
                                    <ul className="py-1 text-sm text-gray-700" aria-labelledby="dropdownDefault">
                                        {listMonth.map((val, idx) => {
                                            if ((idx < indexStartRev && idx > indexStartRev - 12) || indexStartRev == -1) {
                                                return <li className='hover:bg-gray-100'>
                                                    <button className="block py-2 pl-4" onClick={() => {
                                                        setStartRevenue(val)
                                                        setDropStartRev(true)
                                                    }}>{val}</button>
                                                </li>
                                            }
                                        }
                                        )}
                                    </ul>
                                </div>
                            </div>
                            <IoIosArrowRoundForward size={30} className='mt-6 mr-3' />
                            <div className='inline'>
                                <button onClick={() => setDropEndRev(!dropEndRev)} id="dropdownDefault" data-dropdown-toggle="dropdown"
                                    className="border border-main-500 rounded-lg bg-white hover:bg-gray-400 hover:text-white font-thin w-32 mr-3 pl-2 mt-5 h-5 sm:h-10 text-center inline-flex items-center" type="button">
                                    {endRevenue}
                                </button>
                                {/* <!-- Dropdown menu --> */}
                                <p className='hidden'>{startRevenue == 'Start Month' ? '' : indexEndRev = listMonth.findIndex((val) => val == startRevenue)}</p>
                                <div id="dropdown" className={`${dropEndRev == true ? 'hidden' : 'z-10 w-32 h-40 overflow-hide-accept bg-white rounded divide-y divide-gray-100 shadow absolute'}`} >
                                    <ul className="py-1 text-sm text-gray-700" aria-labelledby="dropdownDefault">
                                        {listMonth.map((val, idx) => {
                                            if (indexEndRev == -1) {
                                                if (idx > indexEndRev) {
                                                    return <li className='hover:bg-gray-100'>
                                                        <button className="block py-2 pl-4" onClick={() => {
                                                            setEndRevenue(val)
                                                            setDropEndRev(true)
                                                        }}>{val}</button>
                                                    </li>
                                                }
                                            } else {
                                                if (idx > indexEndRev && idx < indexEndRev + 12) {
                                                    return <li className='hover:bg-gray-100'>
                                                        <button className="block py-2 pl-4" onClick={() => {
                                                            setEndRevenue(val)
                                                            setDropEndRev(true)
                                                        }}>{val}</button>
                                                    </li>
                                                }
                                            }
                                        })}
                                    </ul>
                                </div>
                            </div>
                            <button type='button' className='transition mr-4 mt-5 h-10 bg-main-500 border border-main-500 focus:ring-main-500 rounded-lg py-1 px-2 hover:-translate-y-1  w-20 sm:w-30 text-white' onClick={() => {
                                handleFilterRev(sort)
                            }}>Filter</button>
                            <button type='button' className='transition mr-4 mt-5 h-10 bg-main-500 border border-main-500 focus:ring-main-500 rounded-lg py-1 px-2 hover:-translate-y-1  w-20 sm:w-30  text-white' onClick={() => {
                                setLoading(true)
                                setStartRevenue('Start Month')
                                setEndRevenue('End Month')
                                setFilterRev(false)
                                getReport(month, true)
                            }}>Reset</button>
                            <div className='inline'>
                                <button onClick={() => setDropSort(!dropSort)} id="dropdownDefault" data-dropdown-toggle="dropdown"
                                    className="border border-black rounded-lg bg-white hover:bg-gray-400 hover:text-white font-semibold w-32 mr-8 ml-10 pl-2 mt-5 h-5 sm:h-10 text-center inline-flex justify-between items-center" type="button">
                                    {sort}
                                    <IoIosArrowDown />
                                </button>
                                {/* <!-- Dropdown menu --> */}
                                <div id="dropdown" className={`${dropSort == true ? 'hidden' : 'z-10 w-32 mr-8 ml-10 bg-white rounded divide-y divide-gray-100 shadow absolute'}`} >
                                    <ul className="py-1 text-sm text-gray-700" aria-labelledby="dropdownDefault">
                                        <li className='hover:bg-gray-100'>
                                            <button className="block py-2 pl-4" onClick={filterRev ? () => {
                                                setSort('Date')
                                                setLoading(true)
                                                setTimeout(() => setLoading(false), 1000)
                                                setDropSort(true)
                                                handleFilterRev('Date')
                                            }
                                                : () => {
                                                    setSort('Date')
                                                    setLoading(true)
                                                    setTimeout(() => setLoading(false), 1000)
                                                    setDropSort(true)
                                                }}>Date</button>
                                        </li>
                                        <li className='hover:bg-gray-100'>
                                            <button className="block py-2 pl-4" onClick={filterRev ? () => {
                                                setSort('Total Sales')
                                                setLoading(true)
                                                setTimeout(() => setLoading(false), 1000)
                                                setDropSort(true)
                                                handleFilterRev('Total Sales')
                                            }
                                                : () => {
                                                    setSort('Total Sales')
                                                    setLoading(true)
                                                    setTimeout(() => setLoading(false), 1000)
                                                    setDropSort(true)
                                                }}>Total Sales</button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className='ml-5 border border-teal-500 rounded-lg bg-white flex mr-10'>
                            <div>
                                <div className='flex justify-between'>
                                    <p className="sm:text-3xl font-bold mt-5 mb-3 pl-5 text-main-500">TOTAL REVENUE</p>
                                </div>
                                <Line style={{ width: 1200, maxHeight: 400 }} data={sort == 'Date' ? revenueReport : revenueSalesReport} options={options} />
                            </div>
                            <div className='border shadow-lg h-52 bg-gray-100 rounded-lg my-10'>
                                <p className="sm:text-xl font-semibold mt-5 mb-3 px-5">Total Revenue</p>
                                <p className="sm:text-3xl font-bold mt-3 mb-3 pl-5"><Currency price={totalRevenue * listMonth.length} /></p>
                                <p className="sm:text-xl font-semibold mt-5 mb-3 px-5">Average Revenue per Month</p>
                                <p className="sm:text-3xl font-bold mt-3 mb-3 pl-5"><Currency price={totalRevenue} /></p>
                            </div>
                        </div>
                        <div className='ml-5 mt-5 mr-10 grid grid-cols-2'>
                            <div className='border border-teal-500 rounded-lg bg-white mr-5'>
                                <div className='flex justify-between'>
                                    <p className="sm:text-3xl font-bold mt-5 mb-3 pl-5 text-main-500">TRANSACTION</p>
                                </div>
                                <Line style={{ width: 750, maxHeight: 400 }} data={sort == 'Date' ? transactionReport : transactionSalesReport} options={options} />
                            </div>
                            <div className='border border-teal-500 rounded-lg bg-white'>
                                <div className='flex justify-between'>
                                    <p className="sm:text-3xl font-bold mt-5 mb-3 pl-5 text-main-500">USER</p>
                                </div>
                                <Line style={{ width: 750, maxHeight: 400 }} data={sort == 'Date' ? userReport : userSalesReport} options={options} />
                            </div>
                        </div>
                        <div className='ml-5 my-5 border border-teal-500 bg-white rounded-lg flex mr-10' >
                            <div>
                                <div className='flex justify-between'>
                                    <p className="sm:text-2xl font-bold mt-5 mb-3 pl-5 text-main-500">BEST SELLER PRODUCT</p>
                                    <div className='inline'>
                                        <button onClick={() => setDrop(!drop)} id="dropdownDefault" data-dropdown-toggle="dropdown"
                                            className="border rounded-lg bg-white hover:bg-gray-400 hover:text-white font-semibold w-32 mr-16 pl-2 mt-5 h-5 sm:h-10 text-center inline-flex justify-between items-center" type="button">
                                            {month}
                                            <IoIosArrowDown />
                                        </button>
                                        {/* <!-- Dropdown menu --> */}
                                        <div id="dropdown" className={`${drop == true ? 'hidden' : 'z-10 w-32 h-40 overflow-hide-accept bg-white rounded divide-y divide-gray-100 shadow absolute'}`} >
                                            <ul className="py-1 text-sm text-gray-700" aria-labelledby="dropdownDefault">
                                                {listMonth.map((val) => {
                                                    return <li className='hover:bg-gray-100'>
                                                        <button className="block py-2 pl-4" onClick={() => {
                                                            setMonth(val)
                                                            setLoading(true)
                                                            getReport(val)
                                                            setDrop(true)
                                                        }}>{val}</button>
                                                    </li>
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <Line style={{ width: 1200, maxHeight: 400 }} data={productReport} options={options} />
                            </div>
                            <div className='border shadow-lg h-40 bg-gray-100 rounded-lg my-10'>
                                <p className="sm:text-xl font-semibold mt-5 mb-3 px-5">Total Product Sold in {month}</p>
                                <p className="sm:text-3xl font-bold mt-5 mb-3 pl-5">{totalProduct}</p>
                            </div>
                        </div>
                        {/* <div className='ml-5' style={{ width: 600 }}>
                            <Line data={transactionReport} options={options} />
                        </div>
                        <div className='ml-5' style={{ width: 600 }}>
                            <Line data={userReport} options={options} />
                        </div> */}
                    </div>
                </div>
                <Loading loading={loading} />
            </div>
        }
    </div>
    )
}

export default ReportPage