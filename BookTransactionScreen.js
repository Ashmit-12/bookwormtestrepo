import React from 'react';
import { Text, View,TouchableOpacity,StyleSheet,TextInput,Image } from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import Permissions from 'expo-permissions';
import firebase from 'firebase'
import db from '../Config'
import { Alert } from 'react-native';
export default class TransactionScreen extends React.Component {
    
  constructor(){
    super()
    this.state={
      hasCameraPermission:false,
      scanned:false,
      scannedData:'',
      buttonState:'normal',
      scannedBookId:'',
      scannedStudentId:'',
      transactionMessage:''


    }
  }
getCamerPermission=async(id)=>{
  const {status}= await Permissions
  .askAsync(Permissions.CAMERA)

  //status==='granted' is true if the user has given permission
  // status==='greanted' is false if the user has not given pernission 
this.setState({
    hasCameraPermission:status==="granted",
    scanned:false,
    buttonState:id
  })

}
handleBarCodeScaned=async({type,data})=>{
  const {buttonState}=this.state

  if(buttonState==="BookId"){
    this.setState({
      scanned:true,
      scannedBookId:data,
      buttonState:'normal'
    })
  }
  else if(buttonState==="StudentId"){
    this.setState({
      scanned:true,
      scannedStudentId:data,
      buttonState:'normal'
    })
  }
}

initiateBookIssue=async()=>{
// add a transaction
db.collection('transactions').add({
  studentId:this.state.scannedStudentId,
  bookId:this.state.scannedBookId,
  date:firebase.firestore.Timestamp.now().toDate(),
  transactionType:"issue"
})
// change book status
db.collection('books').doc(this.state.scannedBookId).update({
  bookAvailability:false
})
// changing the number of book issued to the student
db.collection('students').doc(this.state.scannedStudentId).update({
  numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
})
Alert.alert("Book Issued")

this.setState({
  scannedStudentId:'',
  scannedBookId:''
})
}

initiateBookReturn=async()=>{
  // add a transaction
  db.collection('transactions').add({
    studentId:this.state.scannedStudentId,
    bookId:this.state.scannedBookId,
    date:firebase.firestore.Timestamp.now().toDate(),
    transactionType:"issue"
  })
  // change book status
  db.collection('books').doc(this.state.scannedBookId).update({
    bookAvailability:true
  })
  // changing the number of book issued to the student
  db.collection('students').doc(this.state.scannedStudentId).update({
    numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
  })
  Alert.alert("Book Returned")
  
  this.setState({
    scannedStudentId:'',
    scannedBookId:''
  })
  }
  
handleTransaction=async()=>{
  var transactionMessage
  db.collection('books').doc(this.state.scannedBookId).get()
  .then((doc)=>{
    var books=doc.data()
    if(books.bookAvailability){
      this.initiateBookIssue()
      transactionMessage="Book Issued"
    } else{
      this.initiateBookReturn()
      transactionMessage="Book Returned"
    }
  }) 
  this.setState({
    transactionMessage:transactionMessage
  })

}

  render() {
    const hasCameraPermission=this.state.hasCameraPermission
    const scanned= this.state.scanned
    const buttonState=this.state.buttonState
    if( buttonState!=='normal'&& hasCameraPermission){
return(
  <BarCodeScanner onBarCodeScanned={
    scanned? undefined : this.handleBarCodeScaned
  }
  style={StyleSheet.absoluteFillObject}
  />
)
    }
    else if(buttonState==='normal'){    
      return (
        <View style={styles.container}>
          <View>
<Image

source={require('../assets/BookWorm-removebg-preview.png')}
style={{width:400, height:300}}
/>
<Text style={{textAlign:'center',fontSize:30, fontWeight:'bold'}}>BOOKWORM</Text>
          </View>
          <View style={styles.inputView}>
<TextInput
style={styles.inputBox}
placeholder='Book Id'
value={this.state.scannedBookId}
/>
<TouchableOpacity style={styles.scanButton}
onPress={()=>{
  this.getCamerPermission("BookId")
}}
>
  <Text style={styles.buttonText}>SCAN</Text>
</TouchableOpacity>
          </View>

          <View style={styles.inputView}>
<TextInput
style={styles.inputBox}
placeholder='Student Id'
value={this.state.scannedStudentId}
/>
<TouchableOpacity style={styles.scanButton}
onPress={()=>{
  this.getCamerPermission("StudentId")
}}
>
  <Text style={styles.buttonText}>SCAN</Text>
</TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.submitButton}
          onPress={()=>{
            this.handleTransaction()
          }}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#9DBAEF',
    justifyContent: 'center',
    alignItems: 'center',

  },
  displayText:{
    fontSize: 15,
    textDecorationLine: 'underline'
  },
  scanButton:{
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10
  },
  buttonText:{
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    fontWeight:'bold'
  },
  inputView:{
    flexDirection: 'row',
    margin: 20
  },
  inputBox:{
    width: 200,
    height: 40,
    borderWidth: 2,
    borderRightWidth: 0,
    fontSize: 20,
    textAlign:'center',
    fontWeight:'bold'
  },
  scanButton:{
    backgroundColor: '#66BB6A',
    width: 50,
    borderWidth: 2,
    borderLeftWidth: 0

  },
  submitButton:{
    backgroundColor: '#FBC02D',
    width: 100,
    height:50
  },
  submitButtonText:{
    padding: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight:"bold",
    color: 'white'
  }
});
