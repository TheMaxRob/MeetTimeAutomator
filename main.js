const { app, BrowserWindow, Menu, MenuItem, dialog } = require('electron/main');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
require('dotenv').config();


function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    });

    win.loadFile('index.html');
}

const menu = new Menu();
menu.append(new MenuItem({
    label: 'Electron',
    submenu: [{
        role: 'help',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
        click: () => {
            console.log("Electron rocks");
            fetchAvailability().then(events => {
                console.log("Fetched events:", events);
            }).catch(err => {
                console.error("Error in fetchAvailability:", err);
            });
        }
    }]
}));

Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

async function fetchAvailability() {
    console.log('fetchAvailability called');
    const calendarId = 'maxroberts2003@gmail.com';
    
    const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];
    const credentials = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI
    };

    const auth = new OAuth2Client(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uri
    );

    const authUrl = auth.generateAuthUrl({
        access_type: 'offline', 
        scope: scopes,
    });

    const authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    authWindow.loadURL(authUrl);
    
    const code = await new Promise((resolve) => {
        const inputBox = dialog.showMessageBoxSync({
            type: 'question',
            buttons: ['OK'],
            title: 'Authorization',
            message: 'Visit the URL, authorize the app, and enter the code provided by Google.',
            detail: authUrl,
            input: true 
        });
        resolve(inputBox);
    });
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);
    console.log('Tokens acquired: ', tokens);

    const calendar = google.calendar({ version: 'v3', auth });

    // One week of your calendar
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000 * 7));

    try {
        const response = await calendar.events.list({
            calendarId,
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true,
        });

        const events = response.data.items || [];
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

exchangeCodeForTokens('4/1ATx3LY4zTn36vZrwoEIYe6Jzz4NDyJVeYlUgsbtzmZ67JE4tNU-_444Qz70');
async function exchangeCodeForTokens(authorizationCode) {
    const auth = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
    );

    const { tokens } = await auth.getToken(authorizationCode);
    auth.setCredentials(tokens);
    console.log('Tokens acquired:', tokens);

    // Now use `auth` to make requests to Google APIs
    const calendar = google.calendar({ version: 'v3', auth });

    // Example: list events
    const response = await calendar.events.list({
        calendarId: 'primary', // Replace with your calendar ID
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });
    const events = response.data.items;
    console.log('Events:', events);

    
}

// Call this function with the authorization code you received
