import (
	"net/http"
	"net/url"
)
import "io/ioutil"
import "fmt"
import "strings"


resp, err := http.Get("http://localhost:5000/")
if err != nil {
	panic(err)
}
defer resp.Body.Close()
body, err := ioutil.ReadAll(resp.Body)
fmt.Println(body)