import React from 'react'
import ExamCard from './ExamCard'
import img from '../assets/signup.svg'

const ExamList = ({role}) => {
  return (
    <>
    <main className='p-4'>
      <ExamCard data={{title: "C programming", image: img, duration: "30", id: 1234}} role={role} />
    </main>
    </>
  )
}

export default ExamList