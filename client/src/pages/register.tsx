// import {
//     Button,
//     Flex,
//     FormControl,
//     FormLabel,
//     Heading,
//     Input,
//     Stack,
//     useColorModeValue,
// } from '@chakra-ui/react';
// import { ErrorMessage, useFormik } from 'formik';
// import { FieldError, useRegisterMutation } from '../generated/graphql';
// import * as Yup from 'yup'
// import { toErrorMap } from '../utils/toErrorMap';
// import { useRouter } from 'next/router';
// import { useState } from 'react';

// export default function Register(): JSX.Element {
//     const [usernameexist, setUserNameExist] = useState('')
//     const router = useRouter()
//     const [, register] = useRegisterMutation()
//     const formik = useFormik({
//         initialValues: {
//             username: "",
//             password: "",
//         },
//         validationSchema: Yup.object().shape({
//             username: Yup.string()
//                 .min(2, 'Username must be greater than 2 chars')
//                 .required("Please enter your username"),
//             password: Yup.string().min(4, 'Password must be greater then 4 chars').required("Please enter your password")
//         }),
//         onSubmit: async (values, { resetForm, setStatus }, actions) => {
//             console.log(JSON.stringify(values, null, 2));
//             resetForm()
//             const response = await register(values)
//             if (response.data?.register.errors) {
//                 const gg = response.data.register.errors[0].message.toString()
//                 setStatus(toErrorMap(response.data.register.errors))
//                 setUserNameExist(gg)
//             }
//             else if (response.data?.register.user) {
//                 //worked
//                 router.push('/')
//             }
//         }
//     });

//     return (
//         <Flex
//             minH={'100vh'}
//             align={'center'}
//             justify={'center'}
//             bg={useColorModeValue('gray.50', 'gray.800')}>
//             <Stack
//                 spacing={4}
//                 w={'full'}
//                 maxW={'md'}
//                 bg={useColorModeValue('white', 'gray.700')}
//                 rounded={'xl'}
//                 boxShadow={'lg'}
//                 p={6}
//                 my={12}>
//                 <form onSubmit={formik.handleSubmit}>
//                     <Heading lineHeight={1.1} fontSize={{ base: '2xl', md: '3xl' }}>
//                         Login
//                     </Heading>
//                     <FormControl id="username" mt={4}>
//                         <FormLabel htmlFor='username'>Username <span style={{ color: 'red' }}>*</span></FormLabel>
//                         <Input
//                             placeholder="username"
//                             _placeholder={{ color: 'gray.500' }}
//                             onChange={formik.handleChange}
//                             value={formik.values.username}
//                             onBlur={formik.handleBlur}
//                             name="username"
//                         />
//                         {formik.touched.username && formik.errors.username ? (
//                             <span className="error" style={{ color: 'red' }}>{formik.errors.username}</span>
//                         ) : null}
//                         {usernameexist.toString() !== '' ? <span className='error' style={{ color: 'red' }}> The username already exists</span> : null}
//                     </FormControl>
//                     <FormControl id="password" mt={5}>
//                         <FormLabel htmlFor='password'>Password <span style={{ color: 'red' }}>*</span> </FormLabel>
//                         <Input type="password" placeholder='*****' onChange={formik.handleChange} value={formik.values.password} name="password" />
//                         {formik.touched.password && formik.errors.password ? (
//                             <span className="error" style={{ color: 'red' }}>{formik.errors.password}</span>
//                         ) : null}
//                     </FormControl>
//                     <Stack spacing={6} mt={4}>
//                         <Button
//                             type='submit'
//                             bg={'blue.400'}
//                             color={'white'}
//                             _hover={{
//                                 bg: 'blue.500',
//                             }}
//                         >
//                             Submit
//                         </Button>
//                     </Stack>
//                 </form>
//             </Stack>
//         </Flex >

//     );
// }

import React from "react";
import { Formik, Form } from "formik";
import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import InputField from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [_, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values });
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            // worked
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Flex maxH={"100vh"} align={"center"} justify={"center"}>
            <Stack
              spacing={4}
              w={"full"}
              maxW={"md"}
              bg={useColorModeValue("white", "gray.700")}
              rounded={"xl"}
              boxShadow={"lg"}
              p={6}
              my={12}
            >
              <Heading
                lineHeight={1.1}
                fontSize={{ base: "3xl", md: "4xl" }}
                textColor="teal"
              >
                Register
              </Heading>
              <Form>
                <InputField
                  textarea={false}
                  name="username"
                  placeholder="username"
                  label="Username"
                />
                <Box mt={4}>
                  <InputField
                    textarea={false}
                    name="email"
                    placeholder="email"
                    label="Email"
                  />
                </Box>
                <Box mt={4}>
                  <InputField
                    textarea={false}
                    name="password"
                    placeholder="password"
                    label="Password"
                    type="password"
                  />
                </Box>
                <Button
                  mt={4}
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme="teal"
                >
                  register
                </Button>
              </Form>
            </Stack>
          </Flex>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Register);
