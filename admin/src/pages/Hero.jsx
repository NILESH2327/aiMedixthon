import React from 'react'
import Navbar from '../components/Navbar'
import { heroStyles } from '../assets/dummyStyles'
import logoImg from '../assets/logo.png'

const Hero = (role ="admin" ,userName="Doctor") => {

  const isDoctor = role === "doctor";

  return (
    <div className={heroStyles.container}>
      <Navbar/>
      <main className={heroStyles.mainContainer}>
        <section className={heroStyles.section}>
          <div className={heroStyles.decorativeBg.container}>

            <div className={heroStyles.decorativeBg.blurBackground}>
              <div className={heroStyles.decorativeBg.blurShape}></div>
              

            </div>
            <div className={heroStyles.contentBox}>
              <div className={heroStyles.logoContainer}>

                <img src={logoImg} alt="logo"  className={heroStyles.logo}/>


              </div>
              <h1 className={heroStyles.heading}>
                {isDoctor ?`Welcome, Dr. ${userName}`:"WELCOME TO MEDIXTHON ADMIN PANEL" }

              </h1>
              <p className={heroStyles.description}>
                {isDoctor ? "Access your patient records, manage appointments, and review medical reports securely from your dashboard."
                 : "Manage hospital operations, doctors, staff, patient records, and system settings from a centralized control panel." }
              </p>

              {/* info cards */}
               <div className={heroStyles.infoCards.container}>
                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                     Secure Access
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Role-Based Authentication with protected date.
                  </p>
                </div>

                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                     Real-Time management
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Monitor hospital activity ans patient flow.
                  </p>
                </div>

                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                     Medical Dashboard
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    clean,fast,and Doctor freindly Interface.
                  </p>
                </div>


               </div>

            </div>

          </div>


        </section>
         
      </main> 
    </div>
  )
}

export default Hero
