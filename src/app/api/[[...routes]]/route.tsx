/** @jsxImportSource frog/jsx */
import { Button, Frog, TextInput } from 'frog';
import { handle, getFrameMetadata } from 'frog/next';
import { neynar as neynarHub } from 'frog/hubs';
import { neynar as neynarMiddleware } from 'frog/middlewares';
import type { Metadata } from 'next';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { Box, Column, Text, Spacer, vars } from '@/app/utils/ui';
import { getUserOwnedFanTokens } from '../gql/getUserOwnedFanTokens';
import { getVestingContractAddress } from '../gql/getVestingContractAddress';

dotenv.config();

const { NEYNAR_API_KEY, BASE_URL } = process.env;

const INTENT_FOLLOW_ME = 'https://warpcast.com/nickysap';

type State = {
    portfolio: any[];
};

const app = new Frog<{ State: State }>({
    title: 'Moxie Portfolio',
    ui: { vars },
    assetsPath: '/',
    basePath: '/api',
    imageAspectRatio: '1:1',
    imageOptions: {
        height: 1024,
        width: 1024,
    },
    initialState: {
        portfolio: [],
    },
    hub: neynarHub({ apiKey: NEYNAR_API_KEY as string }),
    verify: process.env.NODE_ENV === 'production',
    origin: BASE_URL as string,
    headers: { 'cache-control': 'max-age=0' },
}).use(
    neynarMiddleware({
        apiKey: NEYNAR_API_KEY as string,
        features: ['interactor', 'cast'],
    })
);

app.frame('/', (c) => {
    return c.res({
        image: (
            <Box
                alignVertical='center'
                backgroundImage='url(https://moxie.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffans.74a7f7cf.png&w=1200&q=75)'
                backgroundColor='bg'
                justifyContent='center'
                paddingTop='52'
                paddingLeft='80'
                paddingRight='80'
                backgroundSize='120% 150%'
                backgroundPosition='top -10%'
            >
                <Box
                    backgroundColor='linear'
                    borderTopLeftRadius='80'
                    borderTopRightRadius='80'
                    paddingTop='20'
                    paddingLeft='20'
                    paddingRight='20'
                    height='100%'
                    width='100%'
                    alignContent='center'
                    justifyContent='center'
                >
                    <Text color='white' align='center' size='32'>
                        What's in your wallet?
                    </Text>
                    <Spacer size='24' />
                    <Text color='white' align='center' size='20'>
                        Check your Moxie Fan Token Portfolio
                    </Text>
                </Box>
            </Box>
        ),
        intents: [
            <Button value='check'>Portfolio</Button>,
            <Button.Link href={INTENT_FOLLOW_ME}>Follow me</Button.Link>,
        ],
        action: '/portfolio',
    });
});

function renderPortfolio(c: any, state: any, page: number = 0) {
    const itemsPerPage = 5;
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const portfolioToShow = state.portfolio.slice(start, end);
    const portfolioLength = state.portfolio.length;
    const hasMore = portfolioLength > end;
    const address = c.var.interactor?.verifications[0] as string;
    return c.res({
        image: (
            <Box
                alignVertical='center'
                backgroundImage='url(https://moxie.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffans.74a7f7cf.png&w=1200&q=75)'
                backgroundColor='bg'
                justifyContent='center'
                paddingTop='30'
                paddingLeft='80'
                paddingRight='80'
                backgroundSize='120% 150%'
                backgroundPosition='top -10%'
            >
                <Box
                    backgroundColor='linear'
                    borderTopLeftRadius='80'
                    borderTopRightRadius='80'
                    paddingTop='20'
                    paddingLeft='20'
                    paddingRight='20'
                    height='100%'
                    width='100%'
                    alignContent='center'
                    justifyContent='center'
                >
                    <Text color='white' align='center' size='32'>
                        Your Moxie Fan Token Portfolio
                    </Text>
                    <Spacer size='24' />
                    {portfolioToShow.map((token: any) => (
                        <Box
                            display='flex'
                            flexDirection='row'
                            gap='4'
                            alignItems='flex-start'
                            justifyContent='center'
                        >
                            <Text color='purple400' size='20'>
                                {token.subjectToken.name}:
                            </Text>
                            <Text color='white' size='20'>
                                {parseInt(ethers.formatUnits(token.balance, 18))
                                    .toFixed(2)
                                    .toLocaleString()}
                            </Text>
                        </Box>
                    ))}
                    {hasMore && (
                        <Box
                            display='flex'
                            alignContent='center'
                            justifyContent='center'
                            paddingTop='10'
                        >
                            <Text color='white' align='center' size='16'>
                                Plus {portfolioLength - end} more
                            </Text>
                            <Text color='white' align='center' size='16'>
                                Click below to show more
                            </Text>
                        </Box>
                    )}
                </Box>
            </Box>
        ),
        intents: [
            <Button action={`/stats/${address}`} value='stats'>
                Stats
            </Button>,
            hasMore && (
                <Button action={`/portfolio/${page + 1}`} value='more'>
                    More
                </Button>
            ),
            page > 0 && (
                <Button action='/portfolio' value='back'>
                    Back
                </Button>
            ),
            !hasMore && (
                <Button action={`/stats/${address}`} value='stats'>
                    Stats
                </Button>
            ), //<Button.Link href={INTENT_SHARE_FRAME}>Share Frame</Button.Link>,
        ].filter(Boolean),
    });
}

app.frame('/portfolio', async (c) => {
    const { deriveState } = c;
    const state = await deriveState(async (previousState: any) => {
        const address = c.var.interactor?.verifications[0] as string;
        const vestingContractAddress = await getVestingContractAddress(address);
        const response = await getUserOwnedFanTokens(
            vestingContractAddress?.tokenLockWallets[0]?.address
        );
        previousState.portfolio = response?.users[0]?.portfolio || [];
        return previousState;
    });

    if (!state.portfolio || state.portfolio.length === 0) {
        return c.res({
            image: (
                <Box
                    grow
                    backgroundColor='purple400'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                >
                    <Text>No Fan Tokens Found</Text>
                </Box>
            ),
            intents: [
                <Button value='back' action='/'>
                    Go back
                </Button>,
            ],
        });
    }

    return renderPortfolio(c, state, 0);
});

app.frame('/portfolio/:page', async (c) => {
    const page = parseInt(c.req.param('page') || '0');
    const { deriveState } = c;
    const state = await deriveState(async (previousState: any) => {
        if (!previousState.portfolio || previousState.portfolio.length === 0) {
            const address = c.var.interactor?.verifications[0] as string;
            const vestingContractAddress = await getVestingContractAddress(
                address
            );
            const response = await getUserOwnedFanTokens(
                vestingContractAddress?.tokenLockWallets[0]?.address
            );
            previousState.portfolio = response?.users[0]?.portfolio || [];
        }
        return previousState;
    });

    return renderPortfolio(c, state, page);
});

app.frame('/stats/:address', async (c) => {
    const address = c.req.param('address');
    console.log('stats address: ', address);
    const vestingContractAddress = await getVestingContractAddress(address);
    const response = await getUserOwnedFanTokens(
        vestingContractAddress?.tokenLockWallets[0]?.address
    );
    const totalTokens = response?.users[0].portfolio.length;
    const totalSupply = response?.users[0].portfolio.reduce(
        (acc: any, token: any) =>
            acc + parseInt(ethers.formatUnits(token.balance, 18)),
        0
    );
    const buyVolume = response?.users[0].portfolio.reduce(
        (acc: any, token: any) =>
            acc + parseInt(ethers.formatUnits(token.buyVolume, 18)),
        0
    );
    const sellVolume = response?.users[0].portfolio.reduce(
        (acc: any, token: any) =>
            acc + parseInt(ethers.formatUnits(token.sellVolume, 18)),
        0
    );

    // Create the INTENT_SHARE_FRAME URL dynamically
    const castUrl = 'https://warpcast.com/~/compose';
    const castText = 'I checked my Moxie Fan Token portfolio. Check yours out here!';
    const embedUrl = `${BASE_URL}/api/stats/${address}`;
    const INTENT_SHARE_FRAME = `${castUrl}?text=${encodeURIComponent(
        castText
    )}&embeds[]=${encodeURIComponent(embedUrl)}`;

    return c.res({
        image: (
            <Box
                alignVertical='center'
                backgroundImage='url(https://moxie.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffans.74a7f7cf.png&w=1200&q=75)'
                backgroundColor='bg'
                justifyContent='center'
                paddingTop='52'
                paddingLeft='80'
                paddingRight='80'
                backgroundSize='120% 150%'
                backgroundPosition='top -10%'
            >
                <Box
                    backgroundColor='linear'
                    borderTopLeftRadius='80'
                    borderTopRightRadius='80'
                    paddingTop='20'
                    paddingLeft='20'
                    paddingRight='20'
                    height='100%'
                    width='100%'
                    alignContent='center'
                    justifyContent='center'
                >
                    <Text color='white' align='center' size='32'>
                        Your Moxie Fan Token Stats
                    </Text>
                    <Spacer size='24' />
                    <Box
                        display='flex'
                        flexDirection='row'
                        gap='4'
                        alignItems='center'
                        justifyContent='center'
                    >
                        <Text color='purple400' size='20'>
                            Total Tokens:
                        </Text>
                        <Text color='white' size='20'>
                            {totalTokens}
                        </Text>
                    </Box>
                    <Box
                        display='flex'
                        flexDirection='row'
                        gap='4'
                        alignItems='center'
                        justifyContent='center'
                    >
                        <Text color='purple400' size='20'>
                            Total Supply:
                        </Text>
                        <Text color='white' size='20'>
                            {totalSupply.toFixed(2).toLocaleString()}
                        </Text>
                    </Box>
                    <Box
                        display='flex'
                        flexDirection='row'
                        gap='4'
                        alignItems='center'
                        justifyContent='center'
                    >
                        <Text color='purple400' size='20'>
                            Buy Volume ($MOXIE):
                        </Text>
                        <Text color='white' size='20'>
                            {buyVolume > 0
                                ? buyVolume.toFixed(2).toLocaleString()
                                : '0'}
                        </Text>
                    </Box>
                    <Box
                        display='flex'
                        flexDirection='row'
                        gap='4'
                        alignItems='center'
                        justifyContent='center'
                    >
                        <Text color='purple400' size='20'>
                            Sell Volume ($MOXIE):
                        </Text>
                        <Text color='white' size='20'>
                            {sellVolume > 0
                                ? sellVolume.toFixed(2).toLocaleString()
                                : '0'}
                        </Text>
                    </Box>
                </Box>
            </Box>
        ),
        intents: [
            <Button action='/portfolio' value='back'>
                Back
            </Button>,
            <Button.Link href={INTENT_SHARE_FRAME}>Share Frame</Button.Link>,
        ],
    });
});

export const GET = handle(app);
export const POST = handle(app);
