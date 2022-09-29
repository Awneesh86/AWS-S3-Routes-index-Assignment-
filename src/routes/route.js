const express = require("express")
const aws = require("aws-sdk")
const router = express.Router();
const { createUser, userLogin } = require('../controllers/userController')
const { createBook, books, getParticularBook, updateBookById, deleteBookById } = require('../controllers/bookController')
const { validUserMW } = require("../middlewares/validUserMW")
const { createBookMW } = require("../middlewares/validBookMW")
const { authentication, authorization, authorization2 } = require("../middlewares/auth")
const { createReview, updateReview, deleteByBookId_ReviewId } = require('../controllers/reviewController')



//<--------------------- aws start ---------------------->


router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})
// s3 and cloud stodare
//  step1: multer will be used to get access to the file in nodejs( from previous session learnings)
//  step2:[BEST PRACTISE]:- always write s2 upload function separately- in a separate file/function..exptect it to take file as input and return the uploaded file as output
// step3: aws-sdk install - as package
// step4: Setupconfig for aws authenticcation- use code below as plugin keys that are given to you
//  step5: build the uploadFile funciton for uploading file- use code below and edit what is marked HERE only


//PROMISES:-
// -you can never use await on callback..if you awaited something , then you can be sure it is within a promise
// -how to write promise:- wrap your entire code inside: "return new Promise( function(resolve, reject) { "...and when error - return reject( err )..else when all ok and you have data, return resolve (data)

aws.config.update({
    // accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    // secretAccessKey: "qGG1HE0qRixcW1T1Wg1bv+08tQrIkFVyDFqSft4J",
    region: "ap-south-1"


    // Access key ID
    // AKIAY3L35MCRZNIRGT6N

    // Secret access key
    // 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


})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE (this is bucket name)
            // Key: "abc/" + file.cover, //HERE 
            Key: "abc/" + file.originalname, //HERE (abc is folder name )
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

        // let data= await s3.upload( uploadParams)
        // if( data) return data.Location
        // else return "there is an error"

    })
}

router.post("/write-file-aws", async function (req, res) {

    try {
        let files = req.files

        if (files && files.length > 0) {
            console.log("files");
            console.log(files);
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await uploadFile(files[0])
            console.log(uploadedFileURL);

            res.status(201).send({ msg: "file uploaded succesfully", data: uploadedFileURL })
        }
        else {
            res.status(400).send({ msg: "No file found" })
        }

    }
    catch (err) {
        res.status(500).send({ status: "false", msg: err })
    }

})

//<--------------------- aws finish ---------------------->



//<--------------------User API's---------------------------->
router.post("/register", validUserMW, createUser)

router.post('/login', userLogin)

//<--------------------Books API's---------------------------->
router.post('/books', authentication, authorization2, createBookMW, createBook)

router.get('/books', authentication, books)

router.get('/books/:bookId', authentication, getParticularBook)

router.put('/books/:bookId', authentication, authorization, updateBookById)

router.delete('/books/:bookId', authentication, authorization, deleteBookById)

//<--------------------Reviews API's---------------------------->
router.post('/books/:bookId/review', createReview)

router.put('/books/:bookId/review/:reviewId', updateReview)

router.delete("/books/:bookId/review/:reviewId", deleteByBookId_ReviewId)

module.exports = router