package types

type Response struct {
	Status     int         `json:"status"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total"`
	TotalItems int         `json:"total_items"`
}
