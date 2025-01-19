import React from 'react'
import ExamCard from './ExamCard'
import img from '../assets/signup.svg'

const ExamList = () => {
  return (
    <>
    <main className='p-4'>
      <ExamCard data={{title: "C programming", image: img, duration: "30"}}/>
    </main>
    </>
  )
}

export default ExamList