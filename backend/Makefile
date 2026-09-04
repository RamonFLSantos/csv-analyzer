CC = gcc

CFLAGS = -Wall -Wextra -std=c11 -Iinclude

LIBS = $(shell pkg-config --cflags --libs libmicrohttpd libcjson)

TARGET = bin/csv-analyzer

SRC = $(wildcard src/*.c)

all:
	mkdir -p bin
	$(CC) $(CFLAGS) $(SRC) -o $(TARGET) $(LIBS)

run: all
	./$(TARGET)

clean:
	rm -rf bin