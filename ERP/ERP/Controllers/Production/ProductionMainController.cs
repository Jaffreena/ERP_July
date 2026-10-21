using Microsoft.AspNetCore.Mvc;

namespace ERP.Controllers.Production
{
    public class ProductionMainController : Controller
    {
        [Route("production")]
        public IActionResult Index()
        {
            return View("~/Views/Production/ProductionMain/Index.cshtml");
        }
    }
}