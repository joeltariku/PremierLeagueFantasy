type Props = {
    text: string;
}

const Header = ({ text }: Props) => {
  return (
    <h1>{text}</h1>
  )
}

export default Header