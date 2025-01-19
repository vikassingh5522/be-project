import React from 'react'

const DashboardHeader = ({username}) => {
  return (
    <>
        <header className='w-full bg-slate-200 flex p-3 shadow'>
            <div className="user ml-auto">
                <h5 className='font-semibold text-gray-700'>Hello! {username}</h5>
            </div>
        </header>
    </>
  )
}

export default DashboardHeader