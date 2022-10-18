const { transport } = require('../config/nodemailer');
const { dbConf, dbQuery } = require('../config/db');


module.exports = {
  getTransaction: async (req, res) => {
    try {
      if (req.dataToken.role.toLowerCase() === 'user') {
        // console.log(req.query)

        let data = req.query;
        let filter = [];
        let sort = [];
        let pagination = [];
        for (let key in data) {
          if (key === 'status_id') {
            if (data[key].length > 1) {
              filter.push(`t.${key} IN (${dbConf.escape(data[key][0])}, ${dbConf.escape(data[key][1])}, ${dbConf.escape(data[key][2])})`)
            } else {
              filter.push(`t.${key}=${data[key]}`)
            }
          } else if (key === 'prescription_pic') {
            filter.push(`t.${key} ${data[key].split('_').join(' ').toUpperCase()}`)
          } else if (key === 'date_order') {
            sort.push(`t.${key} ${data[key].toUpperCase()}`)
          } else if (key === 'start') {
            filter.push(`t.date_order >= ${dbConf.escape(data[key])}`)
          } else if (key === 'end') {
            filter.push(`t.date_order <= ${dbConf.escape(data[key])}`)
          } else if (key === 'date_filter') {
            filter.push(`t.date_order LIKE ${dbConf.escape(data[key] + '%')}`)
          } else if (key === 'limit') {
            pagination.push(`LIMIT ${data[key]}`)
          } else if (key === 'offset') {
            pagination.push(`OFFSET ${data[key]}`)
          }
        }
        // console.log(filter)
        // console.log(sort)

        // console.log(`SELECT * FROM transaction t 
        //   JOIN status s ON t.status_id = s.idstatus 
        //   WHERE ${filter.length > 0 ? filter.join(' AND ') + ' AND' : ''} t.user_id =${dbConf.escape(req.dataToken.iduser)} ${sort.length > 0 ? 'ORDER BY' + ' ' + sort[0] : ''} ${pagination.length > 0 ? pagination.join(' ') : ''};`);

        let getSql = await dbQuery(`SELECT * FROM transaction t 
        JOIN status s ON t.status_id = s.idstatus 
        WHERE ${filter.length > 0 ? filter.join(' AND ') + ' AND' : ''} user_id =${dbConf.escape(req.dataToken.iduser)} ${sort.length > 0 ? 'ORDER BY' + ' ' + sort[0] : ''} ${pagination.length > 0 ? pagination.join(' ') : ''};`);

        let countSql = await dbQuery(`SELECT COUNT(*) AS count FROM transaction t 
        JOIN status s ON t.status_id = s.idstatus 
        WHERE ${filter.length > 0 ? filter.join(' AND ') + ' AND' : ''} user_id =${dbConf.escape(req.dataToken.iduser)} ${sort.length > 0 ? 'ORDER BY' + ' ' + sort[0] : ''};`);

        if (getSql.length > 0) {
          // console.log(getSql)
          let comb = getSql.map(async (val, idx) => {
            // console.log(`SELECT * FROM transaction_detail WHERE transaction_id = ${dbConf.escape(val.idtransaction)};`)
            let detailSql = await dbQuery(`SELECT * FROM transaction_detail WHERE transaction_id = ${dbConf.escape(val.idtransaction)};`)
            return { ...val, transaction_detail: detailSql };
          });

          const resultComb = await Promise.all(comb);

          // console.log(resultComb);
          res.status(200).send({
            results: resultComb,
            count: countSql[0].count
          });
        } else {
          res.status(200).send({
            failed: true,
            message: 'Data Not Found'
          })
        }
      } else {
        let filter = [];
        for (const key in req.query) {
          if (key == 'end') {
            filter.push(`date_order < ${dbConf.escape(req.query[key])}`)
          } else if (key == 'start') {
            filter.push(`date_order > ${dbConf.escape(req.query[key])}`)
          } else {
            filter.push(`${key} = ${dbConf.escape(req.query[key])}`)
          }
        }
        let sqlGet = `Select *,date_format(date_order,'%e %b %Y, %H:%i') as date_order from transaction 
          ${filter.length == 0 ? '' : `where ${filter.join(' AND ')}`} order by date_order desc ;`;
        let transaction = await dbQuery(sqlGet);
        if (transaction) {
          for (i = 0; i < transaction.length; i++) {
            transaction[i].detail = await dbQuery(`SELECT * FROM transaction_detail where transaction_id=${transaction[i].idtransaction};`)
          }
          await res.status(200).send(transaction)
        }
      }

    } catch (error) {
      console.log(error)
      res.status(500).send(error)
    }
  },
  addTransaction: async (req, res) => {
    try {
      // console.log(req.dataToken)
      // console.log(JSON.parse(req.body.datatransaction));
      // console.log(req.files[0].filename);
      // console.log(req.files);
      // console.log(req.body.detail);

      if (req.files) {
        // status_id = 3 karena harus menunggu konfirmasi admin
        // from prescription page
        let data = JSON.parse(req.body.datatransaction);

        await dbQuery(`INSERT INTO transaction (user_id, user_name,user_phone_number, invoice_number, status_id, user_address, order_weight, delivery_price, shipping_courier, prescription_pic)
        VALUES (${dbConf.escape(req.dataToken.iduser)}, ${dbConf.escape(req.dataToken.fullname)}, ${dbConf.escape(req.dataToken.phone_number)}, ${dbConf.escape(data.invoice)}, 3, ${dbConf.escape(data.address)}, ${dbConf.escape(data.weight)},
        ${dbConf.escape(data.delivery)}, ${dbConf.escape(data.courier)}, '/prescription/${req.files[0].filename}');`)
      } else {
        // status_id = 4 menunggu pembayaran
        // from cart-checkout page

        let data = req.body.formSubmit;

        await dbQuery(`INSERT INTO transaction (user_id, user_name,user_phone_number, invoice_number, status_id, user_address, total_price, order_weight, delivery_price, shipping_courier)
        VALUES (${dbConf.escape(req.dataToken.iduser)}, ${dbConf.escape(req.dataToken.fullname)},${dbConf.escape(req.dataToken.phone_number)}, ${dbConf.escape(data.invoice)}, 4, ${dbConf.escape(data.address)}, ${dbConf.escape(data.total)}, ${dbConf.escape(data.weight)},
        ${dbConf.escape(data.delivery)}, ${dbConf.escape(data.courier)});`)

        let get = await dbQuery(`SELECT idtransaction FROM transaction WHERE invoice_number = ${dbConf.escape(data.invoice)};`)

        // console.log(get[0].idtransaction);

        if (get[0].idtransaction > 0) {
          let temp = [];
          req.body.detail.forEach((val, idx) => {
            temp.push(`(${dbConf.escape(val.product_name)}, ${dbConf.escape(val.product_qty)}, ${dbConf.escape(val.product_price)}, ${dbConf.escape(val.product_image)}, ${dbConf.escape(val.product_unit)}, ${dbConf.escape(get[0].idtransaction)}, ${dbConf.escape(val.product_id)})`);
          });
          // console.log(temp.join(', '));

          await dbQuery(`INSERT INTO transaction_detail (product_name, product_qty, product_price, product_image, product_unit, transaction_id, product_id) VALUES
          ${temp.join(', ')};`)

          let history = [];
          req.body.detail.forEach((val, idx) => {
            history.push(`(${dbConf.escape(val.product_name)},${dbConf.escape(req.dataToken.iduser)},${dbConf.escape(val.product_unit)},${dbConf.escape(val.product_qty)},'Penjualan','Pengurangan')`)
          })

          await dbQuery(`INSERT INTO history_stock (product_name, user_id,unit,quantity, type,information) VALUES
          ${history.join(', ')};`)
        }
      }



      res.status(200).send({
        success: true,
        message: 'Add Transaction Success'
      })

    } catch (error) {
      console.log(error);
      res.status(500).send(error)
    }
  },
  updateTransaction: async (req, res) => {
    try {
      if (req.files) {
        let data = JSON.parse(req.body.datatransaction);
        await dbQuery(`UPDATE transaction SET payment_proof_pic='/paymentproof/${req.files[0].filename}' WHERE idtransaction = ${dbConf.escape(data.transactionId)};`)
      } else if (req.body) {
        if (req.body.order == 'ok') {
          if (req.body.status == 6) {
            await dbQuery(`UPDATE transaction SET status_id=${req.body.status + 2} WHERE idtransaction = ${dbConf.escape(req.body.id)};`)
          } else if (req.body.status == 3) {
            await dbQuery(`UPDATE transaction SET status_id=${req.body.status + 1},total_price=${req.body.price} WHERE idtransaction = ${dbConf.escape(req.body.id)};`)
            let detail = []
            req.body.recipe.map((val, idx) => {
              detail.push(`(${dbConf.escape(val.name)},${dbConf.escape(val.qty)},${dbConf.escape(val.unit)},${dbConf.escape(val.price)},${dbConf.escape(req.body.image)},${dbConf.escape(req.body.id)})`)
            })
            await dbQuery(`INSERT INTO transaction_detail (product_name,product_qty,product_unit,product_price,product_image,transaction_id)
            values ${detail.join(', ')}; `)

            for (i = 0; i < req.body.recipe.length; i++) {
              await dbQuery(`UPDATE stock SET stock_unit=stock_unit-${req.body.recipe[i].qty} where product_id = ${req.body.recipe[i].idproduct};`)
            }

          } else {
            await dbQuery(`UPDATE transaction SET status_id=${req.body.status + 1} WHERE idtransaction = ${dbConf.escape(req.body.id)};`)
          }
        } else if (req.body.reason == 'Less Payment Amount') {
          await dbQuery(`UPDATE transaction SET status_id = 4, note = 'Less Payment Amount' WHERE idtransaction = ${dbConf.escape(req.body.id)};`)
        } else if (req.body.reason == 'Medicine Out of Stock') {
          await dbQuery(`UPDATE transaction SET status_id = 7, note = 'Medicine Out of Stock' WHERE idtransaction = ${dbConf.escape(req.body.id)};`)
        }
      }
      res.status(200).send({
        success: true,
        message: 'Transaction Updated'
      })
    } catch (error) {
      console.log(error)
      res.status(500).send(error)
    }
  },
  getReport: async (req, res) => {
    try {
      console.log(req.query)
      let revenue = await dbQuery(`SELECT date_format(date_order,'%b %Y') as month,sum(product_qty*product_price) as revenue FROM transaction join transaction_detail on transaction.idtransaction=transaction_detail.transaction_id where status_id = 9 group by date_format(date_order,'%b %Y') order by date_order;`)
      let revenueSales = await dbQuery(`SELECT date_format(date_order,'%b %Y') as month,sum(product_qty*product_price) as revenue FROM transaction join transaction_detail on transaction.idtransaction=transaction_detail.transaction_id where status_id = 9 group by date_format(date_order,'%b %Y') order by revenue desc;`)
      let transaction = await dbQuery(`SELECT date_format(date_order,'%b %Y') as month,count(*) as transaction FROM transaction where status_id = 9 group by date_format(date_order,'%b %Y ') order by date_order;`)
      let transactionSales = await dbQuery(`SELECT date_format(date_order,'%b %Y') as month,count(*) as transaction FROM transaction where status_id = 9 group by date_format(date_order,'%b %Y ') order by transaction desc;`)
      let user = await dbQuery(`SELECT date_format(date_order,'%b %Y') as month,count(distinct user_id) as user FROM transaction where status_id = 9 group by date_format(date_order,'%b %Y') order by date_order;`)
      let userSales = await dbQuery(`SELECT date_format(date_order,'%b %Y') as month,count(distinct user_id) as user FROM transaction where status_id = 9 group by date_format(date_order,'%b %Y') order by user desc;`)
      let product = await dbQuery(` SELECT product_name,sum(product_qty) as best_seller,date_format(date_order,'%b %Y') as month FROM transaction_detail join transaction on transaction.idtransaction=transaction_detail.transaction_id where date_format(date_order,'%b %Y') = '${req.query.month}' AND status_id = 9 group by product_name order by best_seller desc limit 10 ;`)
      console.log(product)
      res.status(200).send({
        revenue,
        revenueSales,
        transaction,
        transactionSales,
        user,
        userSales,
        product
      })
    } catch (error) {
      console.log(error)
      res.status(500).send(error)
    }
  },
  getHistory: async (req, res) => {
    try {
      let filter = [];
      for (const key in req.query) {
        if (key == 'end') {
          filter.push(`date < ${dbConf.escape(req.query[key])}`)
        } else if (key == 'start') {
          filter.push(`date > ${dbConf.escape(req.query[key])}`)
        } else {
          filter.push(`${key} LIKE ${dbConf.escape('%' + req.query[key] + '%')}`)
        }
      }
      let history = await dbQuery(`select *,date_format(date,'%d %b %Y') as date_change from history_stock
      ${filter.length == 0 ? '' : `where ${filter.join(' AND ')}`} order by date desc;`)
      res.status(200).send(history)
      console.log(history)
    } catch (error) {
      console.log(error)
      res.status(500).send(error)
    }
  }
}