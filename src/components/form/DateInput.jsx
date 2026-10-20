import TextInput from '@/components/form/TextInput'

// Native date picker (value is "YYYY-MM-DD"). Shows the browser's own calendar button.
export default function DateInput(props) {
  return <TextInput type="date" {...props} />
}
