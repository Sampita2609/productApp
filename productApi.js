let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS,PUT,PATCH,DELETE,HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  next();
});
const port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

let { data } = require("./productData.js");
let fs = require("fs");
let fName = "productData.json";
let readline = require("readline-sync");

app.get("/data", function (req, res) {
  let data1 = JSON.stringify(data);
  fs.writeFile(fName, data1, function (err) {
    if (err) res.status(404).send(err);
    else {
      fs.readFile(fName, "utf8", function (err, content) {
        if (err) res.status(404).send(err);
        else {
          let arr = JSON.parse(content);
          res.send(arr);
        }
      });
    }
  });
});

// to get details of shops
app.get("/shops", function (req, res) {
  fs.readFile(fName, "utf8", function (err, content) {
    if (err) res.status(404).send(err);
    else {
      let arr = JSON.parse(content);
      res.send(arr.shops);
    }
  });
});
app.post("/shops", function (req, res) {
  let body = req.body;
  fs.readFile(fName, "utf8", function (err, content) {
    if (err) res.status(404).send(err);
    else {
      let arr = JSON.parse(content);
      let shops = arr.shops;
      let maxId = shops.reduce(
        (acc, curr) => (curr.shopId > acc ? curr.shopId : acc),
        0
      );
      let newId = maxId + 1;
      let item = { shopId: newId, ...body };
      shops.push(item);
      let str = JSON.stringify(arr);
      fs.writeFile(fName, str, function (err) {
        if (err) res.status(404).send(err);
        else res.send(item);
      });
    }
  });
});
app.get("/products", function (req, res) {
  fs.readFile(fName, "utf8", function (err, content) {
    if (err) res.status(404).send(err);
    else {
      let arr = JSON.parse(content);
      res.send(arr.products);
    }
  });
});
app.post("/products", function (req, res) {
  let body = req.body;
  fs.readFile(fName, "utf8", function (err, content) {
    if (err) res.status(404).send(err);
    else {
      let arr = JSON.parse(content);
      let products = arr.products;
      let maxId = products.reduce(
        (acc, curr) => (curr.productId > acc ? curr.productId : acc),
        0
      );
      let newId = maxId + 1;
      let item = { productId: newId, ...body };
      products.push(item);
      let str = JSON.stringify(arr);
      fs.writeFile(fName, str, function (err) {
        if (err) res.status(404).send(err);
        else {
          res.send(item);
        }
      });
    }
  });
});
app.put("/products/:id", function (req, res) {
  let id = +req.params.id;
  let body = req.body;
  fs.readFile(fName, "utf8", function (err, content) {
    if (err) res.status(404).send(err);
    else {
      let arr = JSON.parse(content);
      let products = arr.products;
      let index = products.findIndex((p) => p.productId === id);
      if (index >= 0) {
        let item = { productId: id, ...body };
        products[index] = item;
        let str = JSON.stringify(arr);
        fs.writeFile(fName, str, function (err) {
          if (err) res.status(404).send(err);
          else res.send(item);
        });
      } else res.send("Product Not Found");
    }
  });
});
app.get("/product/:id", function (req, res) {
  let id = +req.params.id;
  fs.readFile(fName, "utf8", function (err, content) {
    if (err) res.status(404).send(err);
    else {
      let arr = JSON.parse(content);
      let products = arr.products;
      let item = products.find((p) => p.productId === id);
      if (item) res.send(item);
      else res.send("No Data Found");
    }
  });
});
// to get the details of purchases
app.get("/purchases", function (req, res) {
  let shop = req.query.shop;
  let product = req.query.product;
  let sort = req.query.sort;
  fs.readFile(fName, "utf8", function (err, content) {
    if (err) res.status(404).send(err);
    else {
      let arr = JSON.parse(content);
      let purchases = arr.purchases;
      if (shop) purchases = purchases.filter((p) => p.shopId === +shop[2]);
      if (product)
        purchases = purchases.filter((p) => p.productid === +product[2]);
      if (sort === "QtyAsc")
        purchases = purchases.sort((pr1, pr2) => pr1.quantity - pr2.quantity);
      if (sort === "QtyDesc")
        purchases = purchases.sort((pr1, pr2) => pr2.quantity - pr1.quantity);
      if (sort === "ValueAsc")
        purchases = purchases.sort(
          (pr1, pr2) => pr1.price * pr1.quantity - pr2.price * pr2.quantity
        );
      if (sort === "ValueDesc")
        purchases = purchases.sort(
          (pr1, pr2) => pr2.price * pr2.quantity - pr1.price * pr1.quantity
        );
      res.send(purchases);
    }
  });
});
// to get specified shops in the purchses
app.get("/purchases/shops/:id", function (req, res) {
  let id = +req.params.id;
  fs.readFile(fName, "utf8", function (err, content) {
    if (err) res.status(404).send(err);
    else {
      let arr = JSON.parse(content);
      let shopArr = arr.purchases.filter((p) => p.shopId === id);
      if (shopArr!==[]) res.send(shopArr);
      else res.status(404).send("No Data Found");
    }
  });
});
// to get specified product details
app.get("/purchases/products/:id", function (req, res) {
  let id = +req.params.id;
  fs.readFile(fName, "utf8", function (err, content) {
    if (err) res.status(404).send(err);
    else {
      let arr = JSON.parse(content);
      let prodArr = arr.purchases.filter((p) => p.productid === id);
      if(prodArr!==[]) res.send(prodArr);
      else res.status.send("No data Found")
    }
  });
});
// to get totalPurchase of specified shop
app.get("/totalPurchase/shop/:id", function (req, res) {
  let id = +req.params.id;
  fs.readFile(fName, "utf8", function (err, content) {
    if (err) res.status(404).send(err);
    else {
      let arr = JSON.parse(content);
      let purchaseArray = arr.purchases;
      let newArr = purchaseArray.filter((pr1) => pr1.shopId === id);
      let newArr1 = newArr.reduce
        (function (acc, curr) {
          let find = acc.find((p) => p.productid === curr.productid);
          if (find) {
            find.quantity += curr.quantity;
            return acc;
          } else return [...acc, curr];
        },
        []
      );
      res.send(newArr1);
    }
  });
});
// to get total purchase of specified product 
app.get("/totalPurchase/product/:id",function(req,res){
  let id=+req.params.id;
  fs.readFile(fName,"utf8",function(err,content){
    if(err) res.status(404).send(err);
    else{
      let arr=JSON.parse(content);
      let purchaseArray=arr.purchases;
      let newArr=purchaseArray.filter((p1)=>p1.productid===id);
      newArr=newArr.reduce(function(acc,curr){
        let find=acc.find((p)=>p.shopId===curr.shopId);
        if(find) {
          find.quantity +=curr.quantity;
          return acc;
        }
        else return [...acc,curr];
      },[])
      res.send(newArr);
    }
  })
})