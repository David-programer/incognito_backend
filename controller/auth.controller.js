const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');
// import { collection, query} from "firebase/firestore";
// const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const db = getFirestore();

async function registerUser(req, res, next){
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(422).json({successful: false, errors: errors.array() })}

    const {name,nickname,password} = req.body;
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash(password, salt);    

    const userJson = {
      name,
      phone: null,
      email: null,
      nickname,
      profilePhoto: null,
      password: pass,
      status: {
        online: true,
        event : {},
      },
      token: jwt.sign(
        { nickname },
        process.env.SAL,
        { expiresIn: "24h", }
      ),
    };
 
    const saveUser = await db.collection("users").add(userJson);
    res.send({ successful: true, data: userJson } );
  } catch (error) {
    console.log(error)
    res.send({ successful: false, error: error, message: e } )
  }
}

async function login(data, callback, io) {
  const userDoc = db.collection('users');
  const querySnapshot  = await userDoc.where('nickname', '==', data.nickname).get();
  
  if (querySnapshot.empty) {
    return callback({successful: false, error: 'create:usernotfound'});
  }  

  const processData = querySnapshot.docs[0].data();

  if (await bcrypt.compare(data.password, processData.password)) {
    const token = jwt.sign(
      { nickname: data.nickname },
      process.env.SAL,
      { expiresIn: "24h", }
    );

    return callback({
      successful: true, 
      data: {...processData, token}, 
      message: 'welcome'
    });
  } else {
    return callback({
      successful: false, 
      data: processData, 
      error: "pass invalid",
    });
  }
}

module.exports = {
  login,
  registerUser,
};

// async function create(req, res, next) {
//   const citiesRef = db.collection('usuarios');
//   const snapshot = await citiesRef.where('email', '==', req.body.email).get();
//   if (!snapshot.empty) {
//     res.send({ successful: false, error: 'vorreo ya existe' } );
//   }

//     try {
//       var salt = await bcrypt.genSalt(10);
//       var pass = await bcrypt.hash(req.body.pass, salt);

//       const id = req.body.email;
//       const userJson = {
//         email: req.body.email,
//         nombre_completo: req.body.nombre_completo,
//         mobil: req.body.mobil,
//         pass: pass,
//         imagenes:[]
//       };
//       var response = await db.collection("usuarios").add(userJson);
//       res.send({ successful: true, data: response } );
//     } catch(error) {
//       res.send({ successful: false, error: error } );
//     }
// }

// async function all(req, res, next) {
//     try {
//         const cityRef = db.collection('usuarios');
//         const snapshot = await cityRef.get();

//         var arrar =[];
//         snapshot.forEach(doc => {
//             var  data = doc.data();
//             data.id = doc.id
//             arrar.push(data);
//         });
//         res.send({ successful: true, data: arrar } );

//       } catch(error) {
//         res.send({ successful: false, error: error } );
//       }
// }

// async function one_doc(req, res, next) {
//   try {
//       const cityRef = db.collection('usuarios').doc(req.body.id);
//       const doc = await cityRef.get();

//       if (!doc.exists) {
//         res.send({ successful: false, error: 'No such document!' } );
//       } else {
//         res.send({ successful: true, data: doc.data() } );
//       }

//     } catch(error) {
//       res.send({ successful: false, error: error } );
//     }
// }