FROM python:3.11-slim
WORKDIR /app
RUN pip install requests redis
COPY x_ingestor.py .
CMD ["python","x_ingestor.py"]
