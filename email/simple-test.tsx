import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

export default function SimpleTest() {
  return (
    <Html>
      <Head />
      <Preview>Simple Test Email</Preview>
      <Body>
        <Container>
          <Heading>Simple Test Email</Heading>
          <Text>This is a simple test email to verify that the preview server works.</Text>
        </Container>
      </Body>
    </Html>
  );
}
