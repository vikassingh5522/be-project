import React from "react";
import { useNavigate } from "react-router-dom";

const JoinExam = () => {
    const [examId, setExamId] = React.useState("");
    const [show, setShow] = React.useState(false);
    const navigator = useNavigate();

    const handleInput = (e) =>{
        setExamId(e.target.value);
        // regex expression to match 8 character - 4 characters - 4 characters - 4 characters - 12 characters
        if(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}[0-9]{4}-[a-z0-9]{12}$/.test(examId)) {
            setShow(false);
            navigator("/exam/"+examId);
        } else {
            setShow(true);
        }

    }



  return (
    <>
      <div className=" flex justify-center items-center min-h-screen">
        <div className="wrapper mx-auto w-[900px]">
            <form>

          <label htmlFor="email" className="block text-sm text-gray-500 ">
            Enter Exam Id
          </label>

          <input
            type="text"
            placeholder="eg. XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
            value={examId}
            onChange={(e) => handleInput(e)}
            className="mt-2 block w-full placeholder-gray-400/70 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 "
          />
          {
            show &&
            <p className="text-red-400" >Enter valid id!</p>
          }
            </form>
        </div>
      </div>
    </>
  );
};

export default JoinExam;
