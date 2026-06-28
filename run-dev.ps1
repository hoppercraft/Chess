# Run both Django backend and React frontend concurrently

$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python manage.py runserver" -PassThru
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru

Write-Host "Backend PID: $($backend.Id)" -ForegroundColor Green
Write-Host "Frontend PID: $($frontend.Id)" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop both..." -ForegroundColor Yellow

try {
    Wait-Process -Id $backend.Id, $frontend.Id -ErrorAction Stop
}
catch {
    Stop-Process -Id $backend.Id, $frontend.Id -Force -ErrorAction SilentlyContinue
}