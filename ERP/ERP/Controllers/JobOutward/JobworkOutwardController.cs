using Microsoft.AspNetCore.Mvc;

namespace ERP.Controllers.JobOutward
{
    public class JobworkOutwardMainController : Controller
    {
        public IActionResult Index()
        {
            return View("~/Views/JobworkOutward/Index.cshtml");
        }
    }
}
