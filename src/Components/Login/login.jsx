import { Alert } from '@mui/material';
import Joi from 'joi';
import { useState } from 'react';
import { NavLink as Link, useNavigate } from 'react-router-dom';
import background from '../../imges/backImg.jpg';
import { publicRequest } from '../axiosRequest';
import style from './Login.module.css';

function Login() {
  const [organization, setOrganization] = useState({ emailorusername: '', password: '' });
  const [isFetching, setisFetching] = useState(false);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  // takes the input from the login form and save it in the organization object
  function handleForm(e) {
    const tempOrg = { ...organization };
    tempOrg[e.target.name] = e.target.value;
    setOrganization(tempOrg);
  }

  function formValidation() { // to validate the input before sending it to the server.
    const schema = Joi.object({
      emailorusername: Joi.string().email({ tlds: { allow: false } }).required(),
      password: Joi.string().required().min(8).pattern(/^[a-zA-Z0-9]{5,20}$/)
        .message('password must start with a character and at least 8 length long.'),
    });

    // abort early false: to keep checking all the inputs -donot stop after the first error-
    return schema.validate(organization, { abortEarly: false });
  }

  const submitForm = async (e) => {
    e.preventDefault();
    setisFetching(true);
    const isFormValid = formValidation();
    if (isFormValid.error) { // invalid input
      setErrors(isFormValid.error.details);
      setisFetching(false);
    } else {
      try {
        let response = await publicRequest.post('login', organization);
        response = response.data;
        if (response.status) {
          const storedOrg = { info: response.user, token: response.token };
          localStorage.setItem('organization', JSON.stringify(storedOrg));
          navigate('/home', { replace: true });
          navigate(0);
        } else {
          setErrors([...errors, { message: response.message }]);
        }
        console.log(response);
        setisFetching(false);
      } catch (error) {
        console.log('error in logging in\n', error);
        isFetching(false);
      }
    }
  };
  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundOrigin: 'content-box',
      }}
      className=" bg-primary position-absolute top-0 bottom-0 start-0 end-0 "
    >
      <div className="container vh-100 vw-100">
        <div className="row w-100 h-100 justify-content-between m-auto  d-flex justify-content-center align-items-center rightContainer">

          <div className="col-md-5 text-center p-4 bg-primary bg-opacity-75 text-white">
            <h1 className={`${style.leftHeader} my-3 `}>BaaS  </h1>
            <h3 className="fw-bold my-5 ">Smarter transportation for your people </h3>
            <h4>  Replace the inefficiencies plaguing your transportation. </h4>
          </div>
          <div className="col-md-5  text-start border border-primary border-5 bg-white fw-bold bg-opacity-75 p-3">
            <h2 className="text-md-center fw-bold"> SIGN IN </h2>
            <form className="m-lg-4 m-md-2 m-0">
              <div className="form-group text-start ">
                <label htmlFor="email" className=" ">Email address</label>
                <input type="email" name="emailorusername" onChange={handleForm} className="form-control" id="exampleFormControlInput1" placeholder="Email" />
              </div>
              <div className="form-group text-start ">
                <label htmlFor="password" className=" ">Password</label>
                <input type="password" name="password" onChange={handleForm} className="form-control" placeholder="Password" />
              </div>

              <div className="validationErrors">
                {errors.map((err, index) => <Alert key={index} className="my-2 p-2" severity="error">{err.message}</Alert>)}
              </div>
              <button onClick={submitForm} className="btn btn-primary mt-3 fs-3 fw-bolder text-white mb-3" disabled={isFetching}>
                {
                  isFetching
                    ? (
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )
                    : 'Login'
                }
              </button>
              <div className="text-end ">
                New user? you can create an account <Link to="/register">here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
