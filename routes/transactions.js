var express = require('express');
var router = express.Router(),
Customer = require("../models/customer"),
Account = require("../models/account"),
User = require("../models/user"),
Employee = require("../models/employee"),
Transactions = require("../models/transactions");
Fawn = require("fawn");
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/premierebank");
var nodemailer = require("nodemailer");
const prompt = require('prompt');
Fawn.init(mongoose);
var mailuser,mailpass;
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user:"bankserver1001@gmail.com",
        pass: "softwareengineering"
    }
});
var rand,mailOptions,host,link;


router.get("/cus/transactions",isLoggedIn,function(req,res){
    Customer.findById(req.user.userid).populate("account").exec(function(err,foundCustomer){
        if(err){
            console.log(err)
        } else{
            res.render("transactions/entry",{customer:foundCustomer});
        }
    })
})

router.get("/cus/transactions/:id/new",isLoggedIn,function(req,res){
    Account.findById(req.params.id).populate("benificiary").exec(function(err,foundAccount){
        if(err){
            console.log(err)
        } else{
            console.log(foundAccount);
            
            res.render("transactions/new",{account:foundAccount});
        }
    })
})
router.put("/cus/trans/check",function(req,res){
    
    transfer(20200002,20200003,300);
    
    
})
router.post("/cus/transactions/:id",isLoggedIn,function(req,res){
    Account.findById(req.params.id).populate("benificiary").exec(function(err,foundAccount){
        if(err){
            console.log(err)
        } else{
            // console.log(+1);

            if(foundAccount.balance>0&&foundAccount.balance>parseInt(req.body.transactions.amount)){
                
            Account.findOne({accountno:req.body.transactions.benacc},function(err,benacc){
                if(err){
                    console.log(err)
                } else{
                    
                    foundAccount.benificiary.forEach(function(bencomp){
                        if(benacc.accountno==bencomp.accountno){

                            (async () => {
                                    try {
                                        console.log(bencomp.accountno+" "+foundAccount.accountno);
                                        
                                        await transfer(parseInt(foundAccount.accountno),parseInt(bencomp.accountno),parseInt(req.body.transactions.amount))
                                        
                                        Transactions.create({from:foundAccount.accountno,to:bencomp.accountno,amount:req.body.transactions.amount},function(err,trans){
                                            if(err){
                                                console.log(err);
                                            } else{
                                                foundAccount.transactions.push(trans);
                                                foundAccount.save();
                                                benacc.transactions.push(trans);
                                                benacc.save();
                                                console.log(foundAccount);
                                                console.log(benacc);
                                             
                                                var receivermail={
                                                    to :"bankserver1001@gmail.com",
                                                    subject :"Premiere Bank",
                                                    html : "Your amount has been credited from the bank "+req.body.transactions.amount+" <br>"
                                                    };
                                                var sendermail={
                                                    to : "bankserver1001@gmail.com",
                                                    subject : "Premiere Bank",
                                                    html : "Your amount has been debited from the bank "+req.body.transactions.amount+" <br>"
                                                }
                                              
                                            
                                                smtpTransport.sendMail(receivermail, function(error, response1){
                                                 if(error){
                                                        console.log(error);
                                                         res.send("error Occured sending mail");
                                                 }else{
                                                    smtpTransport.sendMail(sendermail, function(error, response2){
                                                        if(error){
                                                               console.log(error);
                                                                res.send("error Occured sending mail");
                                                        }else{
                                                              res.send("success")
                                                            }
                                                  
                                               })
                                                     }
                                           
                                        })
                                            }
                                        })
                                        
                                            
                                    } catch (err) {
                                      console.log('error: ' + err)
                                    }
                                  })()
                           
                                        
                        } else{
                            res.redirect("/cus/transactions/")
                        }
                    })
                }
            })
        }
    }
    })
})
//Verify Mail
router.get("/cus/transactions/:id/sendMail",isLoggedIn,function(req,res){
    rand=Math.floor((Math.random() * 10000000) + 54);

    mailOptions={
        to : req.query.to,
        subject : "Please confirm your Transaction",
        html : "Hello,<br> Please Click on the link to verify your email This is your verification id "+rand+" <br>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
        res.send("error");
     }else{
            console.log("Message sent: " + response.message);
            res.redirect("/cus/transactions/"+req.params.id+"/sendMail/new");
         }
});
    
})
//Verify Mail
router.get("/cus/transactions/:id/sendMail/new",isLoggedIn,function(req,res){
    res.render("transactions/verify",{accountid:req.params.id});
})
router.post("/cus/transactions/:id/verify",isLoggedIn,function(req,res){
    var randcode = req.body.randcode;
    if(randcode==rand){
        res.redirect("/cus/transactions/"+req.params.id+"/new");
    } else{
        res.send("Try Again: <a href='/cus/transactions/:id/sendMail/new'>Try again</a>")
    }

    
})
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

async function transfer(senderAccountno,receiverAccountno,amount){
    var task = Fawn.Task();
// try{
    task.update(Account, {accountno: senderAccountno},  {$inc: {balance: -amount}});
    task.update(Account, {accountno: receiverAccountno},  {$inc: {balance: amount}});
    task.run({useMongoose: true})
    .then(function(){
        // update is complete
      })
      .catch(function(err){
        // Everything has been rolled back.
        
        // log the error which caused the failure
        console.log(err);
      });
    } 
    
module.exports = router;