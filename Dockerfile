FROM ubuntu:latest

COPY ./faas-app/target/release/faas_bin /root/

CMD [ "sleep", "infinity" ]