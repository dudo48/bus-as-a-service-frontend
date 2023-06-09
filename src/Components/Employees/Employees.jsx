import { Alert, Snackbar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import AddIcon from '@mui/icons-material/Add';
import { privateRequest } from '../axiosRequest';
import AddBulkLayer from './AddEmplyeeLayer/AddBulkLayer';
import AddEmpLayer from './AddEmplyeeLayer/AddEmpLayer';
import style from './Employees.module.css';
import EditEmpLayer from './EditEmployer/EditEmpLayer';
import PageTitle from '../PageTitle/PageTitle';

function Passengers() {
  const [successAlert, setSuccessAlert] = useState(false);
  const [passengers, setPassengers] = useState([]);

  // to ensure that the data updated after adition of any employer.
  const [trickReload, setTrickReload] = useState(false);

  const [showAddEmp, setShowAddEmp] = useState(false);
  const [showEditEmp, setShowEditEmp] = useState(false);
  const [showBulkLayer, setBulkLayer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editEmpIndex, setEditEmpIndex] = useState(0);

  useEffect(() => {
    try {
      setIsLoading(true);
      privateRequest.get('organization/passengers').then((response) => {
        const employess = response.data.message;
        console.log(response.data.message);
        setPassengers(employess);
        // console.log(employess);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(`error in retriving employes from server: ${error}`);
    }
  }, [trickReload]);

  async function deleteEmploye(id) {
    console.log(`Em id ${id}`);
    try {
      const { data } = await privateRequest.delete(`organization/passengers/${id}`);
      console.log(data);
      setTrickReload((oldState) => !oldState);
    } catch (error) {
      console.log(error);
    }
  }

  const openAlert = () => {
    setSuccessAlert(true);
  };
  const handleClose = (event, reason) => {
    // console.log( "reason is "+ reason);
    if (reason === 'clickaway') { // to keep the alert untill its duration ends or the user clicks on the close icon on the alert
      return; // if the user clicked on any other place on the screen the alert will not disappear.
    }

    setSuccessAlert(false);
  };
  const handleActivation = async (e, id, index) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      try {
        const { data } = await privateRequest.put(`organization/passengers/activate/${id}`);
        passengers[index].activated = true;
        console.log(data);
      } catch (error) {
        console.log(`error in deActivation${error}`);
      }
    } else {
      const { data } = await privateRequest.put(`organization/passengers/deactivate/${id}`);
      console.log(data);
      passengers[index].activated = false;
      console.log(`${e.target.checked} bye${id}`);
    }
  };
  const handleEditEvent = (id) => {
    setEditEmpIndex(id);
    setShowEditEmp(true);
  };

  return (
    <>
      <PageTitle title="Passengers" />
      <button className="btn btn-outline-primary mx-2" onClick={() => setShowAddEmp(true)}>
        <AddIcon />
        {' '}
        Add Employees
      </button>
      <button className="btn btn-primary mx-2" onClick={() => setBulkLayer(true)}>
        <AddIcon />
        {' '}
        Add Bulk
      </button>
      {isLoading ? (
        <div className="w-100 my-5">
          {' '}
          <LinearProgress />
          {' '}
        </div>
      )
        : (
          <table className={`table  table-striped table-responsive table-hover border border-1 m-auto p-0   ${style.table}`}>
            <thead className=" m-auto  ">
              <tr className="border border-1 border-white">
                <th className="" scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Address</th>
                <th scope="col">Activation</th>
              </tr>
            </thead>
            <tbody className=" ">
              {passengers.map((passenger, index) => (
                <tr key={passenger.id}>
                  <th>
                    {' '}
                    {index + 1}
                    {' '}
                  </th>
                  <td>
                    {passenger.name}
                    {' '}
                  </td>
                  <td>
                    {' '}
                    {passenger.email}
                    {' '}
                  </td>
                  <td>
                    {' '}
                    {passenger.phone}
                    {' '}
                  </td>
                  <td>
                    {' '}
                    {passenger.address}
                    {' '}
                  </td>
                  <td>
                    {' '}
                    <Switch
                      onChange={(e) => handleActivation(e, passenger.id, index)}
                      defaultChecked={!!passenger.activated} /* !! converts to boolean */
                    />
                    {' '}
                  </td>
                  <td>
                    {' '}
                    <EditIcon onClick={() => handleEditEvent(passenger.id)} className={` ${style.cursorPointer} ${style.editActionIcon}  `} />
                    {' '}
                  </td>
                  <td>
                    {' '}
                    <DeleteIcon onClick={() => deleteEmploye(passenger.id, setTrickReload)} className={` ${style.cursorPointer} ${style.deleteActionIcon} `} />
                    {' '}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      {/* to confirm for the org that the employer is added */}
      <Snackbar open={successAlert} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          Employees Added  Successfully!
        </Alert>
      </Snackbar>
      <AddEmpLayer
        showAddEmp={showAddEmp}
        openAlert={openAlert}
        setShowAddEmp={setShowAddEmp}
        setTrickReload={setTrickReload}
      />
      <EditEmpLayer
        showAddEmp={showEditEmp}
        emp={passengers[editEmpIndex] ? passengers[editEmpIndex] : null}
        openAlert={openAlert}
        setShowAddEmp={setShowEditEmp}
        setTrickReload={setTrickReload}
      />
      <AddBulkLayer
        showBulkLayer={showBulkLayer}
        setBulkLayer={setBulkLayer}
        openAlert={openAlert}
        setTrickReload={setTrickReload}
      />
    </>
  );
}

export default Passengers;

// Dummy Data:
/* { name: 'Ahmed Ali',
 email: "ahmed.aly@gmail.com",
  phone: "+02 01100110011",
   address: "maryotia,
    king faysl giza street" },
    { name: 'Aly Aly',
     email: "ali.ali@gmail.com",
      phone: "+02 01122110011",
       address: "maryotia, Haram street" },
    { name: 'Mohamed Mohy',
     email: "mohamed.mohy@gmail.com",
      phone: "+02 01133113311",
       address: "elwfaa,
        king faysl giza street" },
    { name: 'Mahmoud Ashraf',
     email: "Mahmoud.ashraf@gmail.com",
      phone: "+02 01144114411",
       address: "elomrania, king faysl giza street" },
    { name: 'Ahmed Megahd',
     email: "ahmed.megahd@gmail.com",
      phone: "+02 01188118811",
       address: "zaid, king faysl giza street" },
    { name: 'Ahmed AboTrika',
     email: "ahmed.trika@gmail.com",
      phone: "+02 01166116611",
       address: "october king faysl giza street" },
  */
