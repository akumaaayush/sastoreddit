import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpvoteSectionProps {
  post: PostSnippetFragment;
}

const UpvoteSection = ({ post }: UpvoteSectionProps) => {
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" alignItems="center">
      <IconButton
        aria-label="upvote post"
        icon={<ChevronUpIcon boxSize="2em" />}
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          console.log(post.voteStatus);
          setLoadingState("upvote-loading");
          await vote({ postId: post.id, value: 1 });
          setLoadingState("not-loading");
        }}
        colorScheme={post.voteStatus === 1 ? "teal" : undefined}
        isLoading={loadingState === "upvote-loading"}
      />

      {post.points}

      <IconButton
        aria-label="downvote post"
        icon={<ChevronDownIcon boxSize="2em" />}
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          console.log(post.voteStatus);
          setLoadingState("downvote-loading");
          await vote({ postId: post.id, value: -1 });
          setLoadingState("not-loading");
        }}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        isLoading={loadingState === "downvote-loading"}
      />
    </Flex>
  );
};

export default UpvoteSection;
