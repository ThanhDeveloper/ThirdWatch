USE [third-watch];

-- password hash: Password@123

declare @data nvarchar(max) = N'[
    {
        "id": "d80c6474-9fd8-4f86-a6b2-d82adf876f42",
        "username": "tonynguyen",
        "email": "thanhdev98@gmail.com",
        "passwordHash": "dZ0XZtr4h1/A14YeuoEmcR/GVrzEGPp9h96FU/zcWLHXNMS4iMGHt2lA1VqCKxZP", 
        "firstName": "Tony",
        "lastName": "Nguyen",
        "status": "Active",
        "type": "Administrator",
        "isExternal": false,
        "createdAt": "2025-08-05T00:00:00.000Z",
        "lastLoginAt": "2025-08-05T00:00:00.000Z",
        "isDeleted": false,
        "profilePictureUrl": "https://i.pinimg.com/736x/a1/fa/68/a1fa6803ce323fa515e247b51cd970cc.jpg",
        "loginProvider": "Internal"
    }
]';

DROP TABLE IF EXISTS #userJsons;

-- Extract users
SELECT *
INTO #userJsons
FROM OPENJSON(@data)
WITH (
    [Id] NVARCHAR(MAX) '$.id',
    [Username] NVARCHAR(MAX) '$.username',
	[Email] NVARCHAR(MAX) '$.email',
    [PasswordHash] NVARCHAR(MAX) '$.passwordHash',
    [FirstName] NVARCHAR(MAX) '$.firstName',
    [LastName] NVARCHAR(MAX) '$.lastName',
    [Status] NVARCHAR(MAX) '$.status',
    [Type] NVARCHAR(MAX) '$.type',
    [IsExternal] NVARCHAR(MAX) '$.isExternal',
    [CreatedAt] NVARCHAR(MAX) '$.createdAt',
    [LastLoginAt] NVARCHAR(MAX) '$.lastLoginAt',
    [IsDeleted] NVARCHAR(MAX) '$.isDeleted',
    [ProfilePictureUrl] NVARCHAR(MAX) '$.profilePictureUrl',
    [LoginProvider] NVARCHAR(MAX) '$.loginProvider'
);

-- use merge transact to update data
MERGE [dbo].[Users] AS target
USING #userJsons AS source
ON target.[Id] = source.[Id]
WHEN MATCHED THEN
    UPDATE SET
        [Username] = source.[Username], 
        [Email] = source.[Email],
        [PasswordHash] = source.[PasswordHash],
        [FirstName] = source.[FirstName],
        [LastName] = source.[LastName],
        [Status] = source.[Status],
        [Type] = source.[Type], 
        [IsExternal] = source.[IsExternal],
        [CreatedAt] = source.[CreatedAt],
        [LastLoginAt] = source.[LastLoginAt],
        [IsDeleted] = source.[IsDeleted],
        [ProfilePictureUrl] = source.[ProfilePictureUrl],
        [LoginProvider] = source.[LoginProvider]
WHEN NOT MATCHED THEN
    INSERT ([Id], [Username], [Email], [PasswordHash], [FirstName], [LastName], [Status], [Type], [IsExternal], [CreatedAt], [LastLoginAt], [IsDeleted], [ProfilePictureUrl], [LoginProvider])
    VALUES (source.[Id], source.[Username], source.[Email], source.[PasswordHash], source.[FirstName], source.[LastName], source.[Status], source.[Type], source.[IsExternal], source.[CreatedAt], source.[LastLoginAt], source.[IsDeleted], source.[ProfilePictureUrl], source.[LoginProvider]);
