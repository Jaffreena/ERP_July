using ERP.Models;
using ERP_DAO;
using ERP_DL;
using ERP_DTO;
using Microsoft.AspNetCore.Mvc;
using System.Data;


namespace ERP.Controllers.JobOutward
{
    public class JO_WorkCentreController : Controller
    {
        Int32? DPageNumber;
        Int32 DPageSize;
        Validation Valid = new Validation();
        DataSet DS = new DataSet();
        Help Help = new Help();

        JO_WorkCentre_DAO JWWC_DAO = new JO_WorkCentre_DAO();
        JO_WorkCentre_DL JWWC_DL = new JO_WorkCentre_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;

        [Route("jobwork/master/jo-workcentre")]
        public IActionResult JO_WorkCentre(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            List<JO_WorkCentre_DTO> JWWC_List = JO_WorkCentreGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View("~/Views/JobworkOutward/JO_WorkCentre/JO_WorkCentre.cshtml", PaginatedList<JO_WorkCentre_DTO>.CreateAsync(JWWC_List, DPageNumber ?? 1, DPageSize));
        }

        [Route("jobwork/master/jo-workcentre")]
        [HttpPost]
        public IActionResult JO_WorkCentre(JO_WorkCentre_DTO JWWC_DTO, String? DeleteNumbers, Int64 Number, String? Mode, String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            JWWC_DTO.JWWC_CreatorCode = UserCode;

            if (Mode == "Save")
            {
                if (ModelState.IsValid)
                {
                    JWWC_DTO.JWWC_Id = 6;
                    DS = JWWC_DAO.JO_WorkCentreDB(JWWC_DTO);
                    if (DS.Tables[0].Rows.Count == 0)
                    {
                        JWWC_DTO.JWWC_Id = 1;
                        JWWC_DAO.JO_WorkCentreDB(JWWC_DTO);

                        JWWC_DTO.Reset();
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
                    JWWC_DTO.JWWC_DeleteNumbers = DeleteNumbers;
                    JWWC_DTO.JWWC_Id = 3;
                    JWWC_DAO.JO_WorkCentreDB(JWWC_DTO);

                    JWWC_DTO.Reset();
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
                    JWWC_DTO.JWWC_Number = Number;
                    JWWC_DTO.JWWC_Id = 8;
                    JWWC_DAO.JO_WorkCentreDB(JWWC_DTO);

                    JWWC_DTO.Reset();
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
                JWWC_DTO.Reset();
                ModelState.Clear();
            }
            else if (Mode == "Edit")
            {
                JWWC_DTO.JWWC_Id = 4;
                DS = JWWC_DAO.JO_WorkCentreDB(JWWC_DTO);
                ViewBag.JO_WorkCentreEdit = JWWC_DL.JO_WorkCentreEdit(DS.Tables[0]).FirstOrDefault();
            }
            else if (Mode == "Update")
            {
                JWWC_DTO.JWWC_Id = 7;
                DS = JWWC_DAO.JO_WorkCentreDB(JWWC_DTO);
                if (DS.Tables[0].Rows.Count == 0)
                {
                    if (ModelState.IsValid)
                    {
                        JWWC_DTO.JWWC_Id = 5;
                        JWWC_DAO.JO_WorkCentreDB(JWWC_DTO);

                        JWWC_DTO.Reset();
                        ModelState.Clear();
                    }
                    else
                    {
                        var Errors = ModelState.SelectMany(m => m.Value!.Errors.Select(s => new { s.ErrorMessage })).Select(p => p.ErrorMessage);
                        string CombinedString = string.Join("<br/>", Errors);

                        ViewBag.ErrorCode = 2;
                        ViewBag.ErrorMessage = CombinedString;

                        JWWC_DTO.JWWC_Id = 4;
                        DS = JWWC_DAO.JO_WorkCentreDB(JWWC_DTO);
                        ViewBag.JO_WorkCentreEdit = JWWC_DL.JO_WorkCentreEdit(DS.Tables[0]).FirstOrDefault();
                    }
                }
            }

            List<JO_WorkCentre_DTO> JWWC_List = JO_WorkCentreGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View("~/Views/JobworkOutward/JO_WorkCentre/JO_WorkCentre.cshtml", PaginatedList<JO_WorkCentre_DTO>.CreateAsync(JWWC_List, DPageNumber ?? 1, DPageSize));
        }

        List<JO_WorkCentre_DTO> JO_WorkCentreGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            DPageSize = 10;

            JO_WorkCentre_DTO JWWC_ListDTO = new JO_WorkCentre_DTO();
            JWWC_ListDTO.JWWC_Id = 2;
            JWWC_ListDTO.JWWC_CreatorCode = UserCode;
            DS = JWWC_DAO.JO_WorkCentreDB(JWWC_ListDTO);

            List<JO_WorkCentre_DTO> JWWC_List = JWWC_DL.JO_WorkCentreList(DS.Tables[0]);
            ViewBag.WorkCentreGroup = Help.GetCat(DS.Tables[1]);
            ViewBag.Warehouse = Help.GetUnder(DS.Tables[2]);
            ViewBag.Process = Help.GetUnder(DS.Tables[3]);

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

            var Key = JWWC_List.OrderByDescending(Cs => Cs.JWWC_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K => (K.JWWC_JW_WorkCentre ?? "").ToLower().Contains(Search.ToLower()) || (K.JWWC_Description ?? "").ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.JWWC_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JWWC_JW_WorkCentre!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JWWC_JW_WorkCentre!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JWWC_Number);
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

        [Route("jobwork/master/jo-workcentre/duplicate")]
        public Boolean JO_WorkCentreDuplicate(String? Title, String? Number)
        {
            JO_WorkCentre_DTO JWWC_DTO = new JO_WorkCentre_DTO();
            JWWC_DTO.JWWC_CreatorCode = UserCode;
            JWWC_DTO.JWWC_JW_WorkCentre = Title;
            if (Convert.ToInt64(Number) == 0)
            {
                JWWC_DTO.JWWC_Id = 6;
            }
            else
            {
                JWWC_DTO.JWWC_Number = Convert.ToInt64(Number);
                JWWC_DTO.JWWC_Id = 7;
            }
            DS = JWWC_DAO.JO_WorkCentreDB(JWWC_DTO);
            return DS.Tables[0].Rows.Count > 0;
        }
    }
}
