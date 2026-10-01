using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobOutward
{
    public class JO_ProcessController : Controller
    {
        const string ViewPath = "~/Views/JobworkOutward/JO_Process/JO_Process.cshtml";

        Int32? DPageNumber;
        Int32 DPageSize;
        Validation Valid = new Validation();
        DataSet DS = new DataSet();
        Help Help = new Help();

        JO_Process_DAO JPRS_DAO = new JO_Process_DAO();
        JO_Process_DL JPRS_DL = new JO_Process_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;

        [Route("jobwork/master/jo-process")]
        public IActionResult JO_Process(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            List<JO_Process_DTO> JPRS_List = JO_ProcessGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(ViewPath, PaginatedList<JO_Process_DTO>.CreateAsync(JPRS_List, DPageNumber ?? 1, DPageSize));
        }

        [Route("jobwork/master/jo-process")]
        [HttpPost]
        public IActionResult JO_Process(JO_Process_DTO JPRS_DTO, String? DeleteNumbers, Int64 Number, String? Mode, String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            JPRS_DTO.JPRS_CreatorCode = UserCode;

            if (Mode == "Save")
            {
                if (ModelState.IsValid)
                {
                    JPRS_DTO.JPRS_Id = 6;
                    DS = JPRS_DAO.JO_ProcessDB(JPRS_DTO);
                    if (DS.Tables[0].Rows.Count == 0)
                    {
                        JPRS_DTO.JPRS_Id = 1;
                        JPRS_DAO.JO_ProcessDB(JPRS_DTO);

                        JPRS_DTO.Reset();
                        ModelState.Clear();
                    }
                }
                else
                {
                    var Errors = ModelState.SelectMany(m => m.Value!.Errors.Select(s => new { s.ErrorMessage })).Select(p => p.ErrorMessage);
                    string CombinedString = string.Join("<br/>", Errors);

                    ViewBag.ErrorCode = 2;
                    ViewBag.ErrorMessage = CombinedString;
                }
            }
            else if (Mode == "DeleteAll")
            {
                try
                {
                    JPRS_DTO.JPRS_DeleteNumbers = DeleteNumbers;
                    JPRS_DTO.JPRS_Id = 3;
                    JPRS_DAO.JO_ProcessDB(JPRS_DTO);

                    JPRS_DTO.Reset();
                    ModelState.Clear();
                }
                catch (Exception ex)
                {
                    ViewBag.ErrorCode = 2;
                    ViewBag.ErrorMessage = Valid.CatchValid(ex.Message);
                }
            }
            else if (Mode == "Delete")
            {
                try
                {
                    JPRS_DTO.JPRS_Number = Number;
                    JPRS_DTO.JPRS_Id = 8;
                    JPRS_DAO.JO_ProcessDB(JPRS_DTO);

                    JPRS_DTO.Reset();
                    ModelState.Clear();
                }
                catch (Exception ex)
                {
                    ViewBag.ErrorCode = 2;
                    ViewBag.ErrorMessage = Valid.CatchValid(ex.Message);
                }
            }
            else if (Mode == "Clear")
            {
                JPRS_DTO.Reset();
                ModelState.Clear();
            }
            else if (Mode == "Edit")
            {
                JPRS_DTO.JPRS_Id = 4;
                DS = JPRS_DAO.JO_ProcessDB(JPRS_DTO);
                ViewBag.JO_ProcessEdit = JPRS_DL.JO_ProcessEdit(DS.Tables[0]).FirstOrDefault();
            }
            else if (Mode == "Update")
            {
                JPRS_DTO.JPRS_Id = 7;
                DS = JPRS_DAO.JO_ProcessDB(JPRS_DTO);
                if (DS.Tables[0].Rows.Count == 0)
                {
                    if (ModelState.IsValid)
                    {
                        JPRS_DTO.JPRS_Id = 5;
                        JPRS_DAO.JO_ProcessDB(JPRS_DTO);

                        JPRS_DTO.Reset();
                        ModelState.Clear();
                    }
                    else
                    {
                        var Errors = ModelState.SelectMany(m => m.Value!.Errors.Select(s => new { s.ErrorMessage })).Select(p => p.ErrorMessage);
                        string CombinedString = string.Join("<br/>", Errors);

                        ViewBag.ErrorCode = 2;
                        ViewBag.ErrorMessage = CombinedString;

                        JPRS_DTO.JPRS_Id = 4;
                        DS = JPRS_DAO.JO_ProcessDB(JPRS_DTO);
                        ViewBag.JO_ProcessEdit = JPRS_DL.JO_ProcessEdit(DS.Tables[0]).FirstOrDefault();
                    }
                }
            }

            List<JO_Process_DTO> JPRS_List = JO_ProcessGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(ViewPath, PaginatedList<JO_Process_DTO>.CreateAsync(JPRS_List, DPageNumber ?? 1, DPageSize));
        }

        List<JO_Process_DTO> JO_ProcessGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            DPageSize = 10;

            JO_Process_DTO JPRS_ListDTO = new JO_Process_DTO();
            JPRS_ListDTO.JPRS_Id = 2;
            JPRS_ListDTO.JPRS_CreatorCode = UserCode;
            DS = JPRS_DAO.JO_ProcessDB(JPRS_ListDTO);

            List<JO_Process_DTO> JPRS_List = JPRS_DL.JO_ProcessList(DS.Tables[0]);
            ViewBag.ConsUoM = Help.GetCat(DS.Tables[1]);
            ViewBag.ProdUoM = Help.GetCat(DS.Tables[1]);
            ViewBag.ScrapUoM = Help.GetCat(DS.Tables[1]);
            ViewBag.ScrapItem = Help.GetCat(DS.Tables[2]);
            ViewBag.SAC = Help.GetCat(DS.Tables[3]);

            if (String.IsNullOrEmpty(SortOrder))
            {
                SortOrder = "Title";
            }
            if (Convert.ToInt32(PageNumber) == 0)
            {
                DPageNumber = 1;
            }
            if (PageFilter?.ToLower() == "PageFilter".ToLower())
            {
                DPageNumber = 1;
            }

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";

            ViewData["CurrentFilter"] = Search;

            var Key = JPRS_List.OrderByDescending(Cs => Cs.JPRS_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K => (K.JPRS_ProcessName ?? "").ToLower().Contains(Search.ToLower()) || (K.JPRS_Description ?? "").ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.JPRS_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JPRS_ProcessName!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JPRS_ProcessName!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JPRS_Number);
                    break;
            }

            if (PSize != 0)
            {
                DPageSize = PSize;
            }
            Int32 Record = Key.ToList().Count;
            if (PageNumber > 1)
            {
                Int32 RecordPage = (Convert.ToInt32(PageNumber) - 1) * DPageSize;

                if (Record > RecordPage)
                {
                    DPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
                }
                else
                {
                    Int32 PageCount = Convert.ToInt32(Math.Ceiling(Convert.ToDouble(Record) / Convert.ToDouble(DPageSize)));

                    DPageNumber = PageNumber > PageCount ? Convert.ToInt32(PageCount) : Convert.ToInt32(PageNumber);
                }
            }
            else
            {
                DPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
            }

            Int32 PageCounts = Convert.ToInt32(Math.Ceiling(Convert.ToDouble(Record) / Convert.ToDouble(DPageSize)));

            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = DPageNumber;
            ViewData["PageSize"] = DPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.ToList().Count;

            return Key.ToList();
        }

        [Route("jobwork/master/jo-process/duplicate")]
        public Boolean JO_ProcessDuplicate(String? Title, String? Number)
        {
            JO_Process_DTO JPRS_DTO = new JO_Process_DTO();
            JPRS_DTO.JPRS_CreatorCode = UserCode;
            JPRS_DTO.JPRS_ProcessName = Title;
            if (Convert.ToInt64(Number) == 0)
            {
                JPRS_DTO.JPRS_Id = 6;
            }
            else
            {
                JPRS_DTO.JPRS_Number = Convert.ToInt64(Number);
                JPRS_DTO.JPRS_Id = 7;
            }
            DS = JPRS_DAO.JO_ProcessDB(JPRS_DTO);
            return DS.Tables[0].Rows.Count > 0;
        }
    }
}
