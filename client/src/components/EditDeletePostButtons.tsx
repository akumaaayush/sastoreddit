import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

export const EditDeletePostButtons = ({
  id,
  creatorId,
}: EditDeletePostButtonsProps) => {
  const [, deletePost] = useDeletePostMutation();

  const [{ data: meData }] = useMeQuery();

  if (meData?.me?.id !== creatorId) return null;
  return (
    <Box>
      <NextLink
        href={{
          pathname: "/post/edit/[id]",
          query: { id: `${id}` },
        }}
      >
        <IconButton
          aria-label="edit-post"
          icon={<EditIcon />}
          mr={2}
          onClick={() => {}}
        />
      </NextLink>
      <IconButton
        aria-label="delete-post"
        icon={<DeleteIcon color="red" />}
        onClick={() => {
          deletePost({ id: id });
        }}
      />
    </Box>
  );
};
