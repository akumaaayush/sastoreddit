import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import Layout from "../components/Layout";
import UpvoteSection from "../components/UpvoteSection";
import {
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data: meData }] = useMeQuery();

  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>The query failed for some reason</div>;
  }

  return (
    <Layout>
      {fetching && !data ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpvoteSection post={p} />
                <Box marginLeft="15px" flex={1}>
                  <NextLink
                    href={{ pathname: "/post/[id]", query: { id: `${p.id}` } }}
                  >
                    <Heading fontSize="xl">{p.title}</Heading>
                  </NextLink>
                  <Flex justifyContent="space-between">
                    <Text>Posted by: {p.creator.username} </Text>

                    <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                  </Flex>
                  <Text mt={2}>{p.textSnippet}</Text>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            margin="auto"
            mt={8}
            mb={10}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

// TODO
// SSR FALSE GARDA CHEI COOKIE READ HANCHA,
