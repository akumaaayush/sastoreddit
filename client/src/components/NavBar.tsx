import NextLink from "next/link";
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  useColorModeValue,
  useBreakpointValue,
  Link,
} from "@chakra-ui/react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

function NavBar() {
  const router = useRouter();
  const [isServer, setIsServer] = useState(true);
  useEffect(() => setIsServer(false), []);

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({});

  let body = null;
  // console.log("data:", data);

  //data is loading
  if (fetching) {
  }
  //user not logged in
  else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Button variant="ghost" marginRight="0px">
            Login
          </Button>
        </NextLink>
        <NextLink href="/register">
          <Button
            display={{ base: "none", md: "inline-flex" }}
            fontSize={"sm"}
            fontWeight={600}
            colorScheme="teal"
            marginLeft={0}
          >
            Register
          </Button>
        </NextLink>
      </>
    );
  }
  //user is logged in
  else {
    body = (
      <Flex>
        <NextLink href="/create-post">
          <Button color="teal.500" mr={5}>
            {" "}
            Create Post!
          </Button>
        </NextLink>
        <Box mt={2} mr={5}>
          {data.me.username}
        </Box>
        <Button
          colorScheme="teal"
          onClick={async () => {
            await logout();
            router.reload();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex
      zIndex={1}
      position="sticky"
      top={0}
      bg={useColorModeValue("white", "gray.800")}
      color={useColorModeValue("gray.600", "white")}
      minH={"60px"}
      py={{ base: 2 }}
      px={{ base: 4 }}
      borderBottom={1}
      borderStyle={"solid"}
      borderColor={useColorModeValue("gray.200", "gray.900")}
      align={"center"}
    >
      <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
        <Link href={"/"}>
          <Text
            textAlign={useBreakpointValue({ base: "center", md: "left" })}
            fontFamily={"heading"}
            color={useColorModeValue("gray.800", "white")}
          >
            SASTOREDDIT
          </Text>
        </Link>
      </Flex>

      <Stack
        flex={{ base: 1, md: 0 }}
        justify={"flex-end"}
        direction={"row"}
        spacing={6}
      >
        {body}
      </Stack>
    </Flex>
  );
}

export default NavBar;
