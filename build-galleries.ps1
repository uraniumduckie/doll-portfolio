$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$categories = @('favorites', 'restavration', 'clothing', 'new-category', 'new-category\sub-1', 'new-category\sub-2', 'new-category\sub-3', 'new-category\sub-4', 'portfolio')
$extensions = @('.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp')
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($cat in $categories) {
    $dir = Join-Path $root (Join-Path 'photos' $cat)
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }

    $files = Get-ChildItem -LiteralPath $dir -File |
        Where-Object { $extensions -contains $_.Extension.ToLower() }

    $sorted = $files | Sort-Object `
        @{ Expression = { -join ([regex]::Matches($_.BaseName, '\d+') | ForEach-Object { $_.Value.PadLeft(12, '0') }) } },
        @{ Expression = { $_.Name } }

    $items = foreach ($file in $sorted) {
        $name = $file.Name -replace '\\', '\\\\' -replace '"', '\"'
        '"' + $name + '"'
    }

    $content = 'window.GALLERY_PHOTOS = [' + ($items -join ',') + '];'
    $listPath = Join-Path $dir 'list.js'
    [System.IO.File]::WriteAllText($listPath, $content, $utf8NoBom)

    Write-Host ("{0}: {1} photos" -f $cat, @($files).Count)
}

Write-Host 'Done. Refresh the page in your browser.'
