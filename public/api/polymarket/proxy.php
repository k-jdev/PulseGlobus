<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


$requestUri = $_SERVER['REQUEST_URI'];
$path = preg_replace('/^\/api\/polymarket\//', '', $requestUri);
$path = preg_replace('/\?.*$/', '', $path); 


$targetUrl = 'https://gamma-api.polymarket.com/' . $path;

if (!empty($_SERVER['QUERY_STRING'])) {
    $targetUrl .= '?' . $_SERVER['QUERY_STRING'];
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);


curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
}


$headers = [
    'Content-Type: application/json',
    'Accept: application/json',
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);


$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);


if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy error: ' . curl_error($ch)]);
    curl_close($ch);
    exit();
}

curl_close($ch);


http_response_code($httpCode);
header('Content-Type: ' . ($contentType ?: 'application/json'));
echo $response;
