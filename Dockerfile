FROM nginx:alpine

COPY car_wash_management_frontend/ /usr/share/nginx/html/

EXPOSE 80
