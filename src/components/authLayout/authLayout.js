import { Grid } from "@mui/material"
import Logo from '../../assets/images/logo.jpg'


import './authLayout.css'
const AuthLayout=({children})=>{
return(
    <Grid container>
        <Grid item xs={12}>
            <img src={Logo} className="authImageLayoutLogo" width={90} height={90} />
            {children}
        </Grid>
    </Grid>
)
}
export default AuthLayout