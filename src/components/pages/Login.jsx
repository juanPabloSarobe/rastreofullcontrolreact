import * as React from "react";
import { extendTheme } from "@mui/joy/styles";
import GlobalStyles from "@mui/joy/GlobalStyles";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Link from "@mui/joy/Link";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import { FormHelperText } from "@mui/joy";
import { InfoOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import logoFullcontrolLargo from "../../assets/logoFullcontrolLargo.webp";
import { useContextValue } from "../../context/Context";

const customTheme = extendTheme({ defaultColorScheme: "dark" });
const Login = () => {
  const { dispatch } = useContextValue();
  const [loginError, setLoginError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleOnLoginError = () => {
    setLoginError(true);
  };
  const toggleOffLoginError = () => {
    setLoginError(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formElements = e.currentTarget.elements;
    const data = {
      username: formElements.userName.value,
      password: formElements.clave.value,
    };

    handleLogin(data);
  };
  const handleLogin = async ({ username, password }) => {
    try {
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      const payload = new URLSearchParams();
      payload.append("usuario", username);
      payload.append("clave", password);

      let requestOptions = {
        method: "POST",
        body: payload.toString(),
        headers: myHeaders,
        redirect: "follow",
        credentials: "include",
      };

      const response = await fetch(
        `api/servicio/login.php/login`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error("Error en la solicitud de inicio de sesión");
      } else {
        const result = await response.json();

        if (result && result.rol) {
          document.cookie = `rol=${result.rol}`;
          document.cookie = `sesion=${result.cookie}`;
          document.cookie = `usuario=${username}`;
          dispatch({ type: "SET_ACCESS_GRANTED", payload: true });
          dispatch({ type: "SET_ROLE", payload: result.rol });
          dispatch({ type: "SET_USER", payload: username });
        } else {
          toggleOnLoginError();
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <>
      <GlobalStyles
        styles={{
          ":root": {
            "--Form-maxWidth": "800px",
            "--Transition-duration": "0.4s",
          },
        }}
      />
      <Box
        sx={(theme) => ({
          width: { xs: "100%", md: "50vw" },
          transition: "width var(--Transition-duration)",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "flex-end",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255 255 255 / 0.5)",
          [theme.getColorSchemeSelector("dark")]: {
            backgroundColor: "rgba(19 19 24 / 0.4)",
          },
        })}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
            width: "100%",
            px: 2,
          }}
        >
          <Box
            component="header"
            sx={{ py: 3, display: "flex", justifyContent: "space-between" }}
          >
            <Box sx={{ gap: 2, display: "flex", alignItems: "center" }}>
              <Box
                component="img"
                src={logoFullcontrolLargo}
                alt="Logo"
                sx={{
                  height: 60,
                  width: "auto",
                  px: 3,
                }}
              />
            </Box>
          </Box>
          <Box
            component="main"
            sx={{
              my: "auto",
              py: 2,
              pb: 5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 400,
              maxWidth: "100%",
              mx: "auto",
              borderRadius: "sm",
              "& form": {
                display: "flex",
                flexDirection: "column",
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: "hidden",
              },
            }}
          >
            <Stack sx={{ gap: 4, mt: 2 }}>
              <Typography component="h1" level="h3">
                Ingresar
              </Typography>
              <form onSubmit={handleSubmit}>
                <FormControl required error={loginError}>
                  <FormLabel>Usuario</FormLabel>
                  <Input
                    type="text"
                    name="userName"
                    onChange={toggleOffLoginError}
                  />
                </FormControl>
                <FormControl required error={loginError}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="clave"
                    onChange={toggleOffLoginError}
                    endDecorator={
                      <Box
                        onClick={togglePasswordVisibility}
                        sx={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </Box>
                    }
                  />
                  {loginError && (
                    <FormHelperText>
                      <InfoOutlined />
                      Error! Usuario o password Incorrecto.
                    </FormHelperText>
                  )}
                </FormControl>
                <Stack sx={{ gap: 4, mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "end",
                      alignItems: "center",
                    }}
                  >
                    <Link
                      href="https://wa.me/+5492994667595?text=necesito%20ayuda%20con%20mi%20password"
                      target="_blank"
                      level="title-sm"
                    >
                      Olvidaste tu password?
                    </Link>
                  </Box>
                  <Button type="submit" fullWidth color="success">
                    Ingresar
                  </Button>
                </Stack>
              </form>
            </Stack>
            <Divider
              sx={(theme) => ({
                [theme.getColorSchemeSelector("light")]: {
                  color: { xs: "#FFF", md: "text.tertiary" },
                },
              })}
            ></Divider>
            <Stack sx={{ gap: 4, mb: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography level="body-sm">
                  no tienes usuario?{" "}
                  <Link
                    href="https://wa.me/+5492994667595?text=necesito%20ayuda%20con%20mi%20usuario"
                    target="_blank"
                    level="title-sm"
                  >
                    Contactanos!
                  </Link>
                </Typography>
              </Stack>
            </Stack>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" sx={{ textAlign: "center" }}>
              © FullcontrolGPS {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={(theme) => ({
          height: "100%",
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          left: { xs: 0, md: "50vw" },
          transition:
            "background-image var(--Transition-duration), left var(--Transition-duration) !important",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          backgroundColor: "background.level1",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage:
            "url(https://images.unsplash.com/photo-1537859925766-13d8d915877d?q=80&w=2992&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
          [theme.getColorSchemeSelector("dark")]: {
            backgroundImage:
              "url(https://images.unsplash.com/photo-1537859925766-13d8d915877d?q=80&w=2992&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
          },
        })}
      />
    </>
  );
};

export default Login;
