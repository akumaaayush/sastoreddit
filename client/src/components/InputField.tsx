import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  textarea: boolean;
};

// justifying !! usage case
// '' => false
// 'error message stuff' => true

const InputField: React.FC<InputFieldProps> = ({
  label,
  size: _,
  textarea,
  ...props
}) => {
  let InputOrTextArea = Input as any;
  if (textarea) {
    InputOrTextArea = Textarea;
  }
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextArea {...field} {...props} id={field.name} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
