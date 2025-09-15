# Config json path

# Get current directory
$currentDirectory = Get-Location
$sqlFolderPath = Join-Path $currentDirectory "data/seed-test-sample"

if (-not $sqlFolderPath) {
    Write-Host "JSON_FOLDER_PATH env variable doesn't config."
    exit
}

# config SQL Server Connection
$serverName = "localhost,1434"
$databaseName = "third-watch"
$username = "sa"
$password = "Password@123"
$connectionString = "Server=$serverName;Database=$databaseName;User Id=$username;Password=$password;TrustServerCertificate=true"

# Load module SQLServer
if (-not (Get-Module -Name SqlServer -ListAvailable)) {
    Write-Host "Module 'SqlServer' is not installed. Installing the module..."
    
    # install module 'SqlServer' from PowerShell Gallery
    Install-Module -Name SqlServer -AllowClobber -Force -Scope CurrentUser
}

if (Get-Module -Name SqlServer -ListAvailable) {
    Write-Host "Module 'SqlServer' is installed. Proceeding with SQL commands..."

    Import-Module -Name SqlServer

    # load sql files
    $sqlFiles = Get-ChildItem -Path $sqlFolderPath -Filter "*.sql"

    foreach ($sqlFile in $sqlFiles) {
        Write-Host "Processing file: $($sqlFile.FullName)" -ForegroundColor DarkYellow

        $sqlQuery = Get-Content $sqlFile.FullName -Raw
        # Execute SQL query
        Invoke-Sqlcmd -Query $sqlQuery -ConnectionString $connectionString

        Write-Host "Completed Processing file: $($sqlFile.FullName)" -ForegroundColor DarkBlue
    }
}else {
    Write-Host "Module 'SqlServer' is not installed. Cannot proceed with SQL commands."
}
