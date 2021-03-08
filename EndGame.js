'use strict';
const React = require('react');
const { Text, Box } = require('ink');

// End Game Screen:
module.exports = ({size}) => (
    <Box
        flexDirection="column"
        height={size}
        width={size}
        alignItems="center"
        justifyContent="center"
    >
        <Text color="red">GAME OVER</Text>
    </Box>
);