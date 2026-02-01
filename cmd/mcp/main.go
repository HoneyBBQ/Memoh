package main

import (
	"context"
	"log"

	"github.com/memohai/memoh/internal/mcp"
	"github.com/memohai/memoh/internal/version"
	gomcp "github.com/modelcontextprotocol/go-sdk/mcp"
)

func main() {
	server := gomcp.NewServer(
		&gomcp.Implementation{Name: "memoh-mcp", Version: version.GetInfo()},
		nil,
	)
	mcp.RegisterTools(server)
	if err := server.Run(context.Background(), &gomcp.StdioTransport{}); err != nil {
		log.Fatal(err)
	}
}
