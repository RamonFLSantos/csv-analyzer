CC = gcc

CFLAGS = -Wall -Wextra -std=c11 -Iinclude

LIBS = $(shell pkg-config --cflags --libs libmicrohttpd libcjson)

TARGET = bin/csv-analyzer
TEST_TARGET = bin/test-analyzer

SRC = $(wildcard src/*.c)
TEST_SRC = tests/test_analyzer.c src/analyzer.c

all:
	mkdir -p bin
	$(CC) $(CFLAGS) $(SRC) -o $(TARGET) $(LIBS)

run: all
	./$(TARGET)

test:
	mkdir -p bin
	$(CC) $(CFLAGS) $(TEST_SRC) -o $(TEST_TARGET)
	./$(TEST_TARGET)

clean:
	rm -rf bin
