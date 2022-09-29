import {Box, chakra, Heading} from "@chakra-ui/react";
import Head from "next/head";
import NextImage from "next/image";
import {Flex, Button, Center} from "@chakra-ui/react";
import absoluteUrl from "next-absolute-url";
import {useRouter} from "next/router";

const Image = chakra(NextImage, {
    shouldForwardProp: (prop) => ["width", "height", "src", "alt", "layout"].includes(prop),
});

export default function Home({contacts}) {
    const router = useRouter();

    const withRefresh = async cb => {
        await cb();
        router.replace(router.asPath);
    };

    const importFromOdoo = async () => {
        await withRefresh(() => {
            return fetch("/api/importFromOdoo", {
                method: "POST",
            });
        });
    };

    const exportToOdoo = async () => {
        await withRefresh(() => {
            return fetch("/api/exportToOdoo", {
                method: "POST",
            });
        });
    }

    const registerOdoo = async () => {
        await withRefresh(() => {
            return fetch("/api/registerOdoo", {
                method: "POST",
            });
        });
    }

    return (
        <div>
            <Head>
                <title>Phone Book</title>
                <meta name="description" content="Integrated Phonebook"/>
            </Head>

            <Flex px={5} py={3}>
                <Button mr={3} onClick={registerOdoo}>Register Odoo</Button>
                <Button mr={3} onClick={importFromOdoo}>Import From Odoo</Button>
                <Button mr={3} onClick={exportToOdoo}>Export To Odoo</Button>
            </Flex>
            <Flex wrap="wrap" px={5} justify="space-between">
                {contacts.people.map((contact) => (
                    <Box key={contact.id} p={5} shadow="md" borderWidth="1px" w="360px" minH="256px" mb={3}>
                        <Box h="200px" w="100%" position="relative">
                            <Image src={`data:image/jpeg;base64,${contact.avatar}`} alt={`${contact.name} avatar`}
                                   layout="fill" objectFit="cover"/>
                        </Box>
                        <Heading fontSize="xl" mt={5}>{contact.name}</Heading>
                        <Box>
                            <Box as="span" fontWeight="semibold">
                                Phone: {contact.phone}
                            </Box>
                            <br/>
                            <Box as="span" fontWeight="semibold">
                                Email: {contact.email}
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Flex>
        </div>
    );
}

Home.getInitialProps = async function ({req, query}) {
    const {protocol, host} = absoluteUrl(req);
    const res = await fetch(`${protocol}//${host}/api/contacts`);
    const contacts = await res.json();
    return {contacts};
};
