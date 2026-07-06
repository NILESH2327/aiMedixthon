import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";

const API_BASE = "http://localhost:4000";

 

const VerifyPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(()=>{
      let cancelled = false;
      const varifyPayment= async()=>{
      console.log("===== VerifyPaymentPage =====");
console.log("Path:", location.pathname);
console.log("Search:", location.search);

const params = new URLSearchParams(location.search);
const sessionId = params.get("session_id");

console.log("Session ID:", sessionId);
      if(location.pathname === '/appointment/cancel'){
         if(!cancelled)
           navigate("/appointments?payment_status=Cancelled", {replace: true});
         return ;

      }

      if(!sessionId){
         if(!cancelled)
          navigate("/appointments?payment_status=Failed" ,{replace:true});
        return;
      }
      try{
        const res = await axios.get(`${API_BASE}/api/appointments/confirm` ,{
          params: {session_id :sessionId},
           timeout : 15000,
        });

        if(cancelled)return ;
        if(res?.data?.success){
           navigate("/appointments?payment_status=Paid" ,{replace :true});
        }else{
            navigate("/appointments?payment_status=Failed" ,{replace:true});

        }

      }catch(error){
        console.error("Payment verification failed" ,error);
        if(!cancelled)
          navigate("/appointments?payment_status=Failed" ,{replace:true});


      };
    };
    varifyPayment();
    return ()=>{
       cancelled = true;
    };

    
  },[location,navigate]);
  return null;
}

export default VerifyPaymentPage