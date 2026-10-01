using ERP.DataList;
using ERP.Models;
using ERP_DAO;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobOutward
{
    public class JO_WorkCentreGroupController : Controller
    {
        const string ViewPath = "~/Views/JobworkOutward/JO_WorkCentreGroup/JO_WorkCentreGroup.cshtml";

        Int32? DPageNumber;
        Int32 DPageSize;
        Validation Valid = new Validation();
        DataSet DS = new DataSet();
        Help Help = new Help();

        JO_WorkCentreGroup_DAO JWCG_DAO = new JO_WorkCentreGroup_DAO();
        JO_WorkCentreGroup_DL JWCG_DL = new JO_WorkCentreGroup_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;

        [Route("jobwork/master/jo-workcentregroup")]
        public IActionResult JO_WorkCentreGroup(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            List<JO_WorkCentreGroup_DTO> JWCG_List = JO_WorkCentreGroupGetData(SortOrder, Search, PageNumber, PSize, PageFilter, 0);
            return View(ViewPath, PaginatedList<JO_WorkCentreGroup_DTO>.CreateAsync(JWCG_List, DPageNumber ?? 1, DPageSize));
        }

        [Route("jobwork/master/jo-workcentregroup")]
        [HttpPost]
        public IActionResult JO_WorkCentreGroup(JO_WorkCentreGroup_DTO JWCG_DTO, String? DeleteNumbers, Int64 Number, String? Mode, String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            JWCG_DTO.JWCG_CreatorCode = UserCode;

            if (Mode == "Save")
            {
                if (ModelState.IsValid)
                {
                    JWCG_DTO.JWCG_Id = 6;
                    DS = JWCG_DAO.JO_WorkCentreGroupDB(JWCG_DTO);
                    if (DS.Tables[0].Rows.Count == 0)
                    {
                        JWCG_DTO.JWCG_Id = 1;
                        JWCG_DAO.JO_WorkCentreGroupDB(JWCG_DTO);

                        JWCG_DTO.Reset();
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
                    JWCG_DTO.JWCG_DeleteNumbers = DeleteNumbers;
                    JWCG_DTO.JWCG_Id = 3;
                    JWCG_DAO.JO_WorkCentreGroupDB(JWCG_DTO);

                    JWCG_DTO.Reset();
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
                    JWCG_DTO.JWCG_Number = Number;
                    JWCG_DTO.JWCG_Id = 8;
                    JWCG_DAO.JO_WorkCentreGroupDB(JWCG_DTO);

                    JWCG_DTO.Reset();
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
                JWCG_DTO.Reset();
                ModelState.Clear();
            }
            else if (Mode == "Edit")
            {
                JWCG_DTO.JWCG_Id = 4;
                DS = JWCG_DAO.JO_WorkCentreGroupDB(JWCG_DTO);
                ViewBag.JO_WorkCentreGroupEdit = JWCG_DL.JO_WorkCentreGroupEdit(DS.Tables[0]).FirstOrDefault();
            }
            else if (Mode == "Update")
            {
                JWCG_DTO.JWCG_Id = 7;
                DS = JWCG_DAO.JO_WorkCentreGroupDB(JWCG_DTO);
                if (DS.Tables[0].Rows.Count == 0)
                {
                    if (ModelState.IsValid)
                    {
                        JWCG_DTO.JWCG_Id = 5;
                        JWCG_DAO.JO_WorkCentreGroupDB(JWCG_DTO);

                        JWCG_DTO.Reset();
                        ModelState.Clear();
                    }
                    else
                    {
                        var Errors = ModelState.SelectMany(m => m.Value!.Errors.Select(s => new { s.ErrorMessage })).Select(p => p.ErrorMessage);
                        string CombinedString = string.Join("<br/>", Errors);

                        ViewBag.ErrorCode = 2;
                        ViewBag.ErrorMessage = CombinedString;

                        JWCG_DTO.JWCG_Id = 4;
                        DS = JWCG_DAO.JO_WorkCentreGroupDB(JWCG_DTO);
                        ViewBag.JO_WorkCentreGroupEdit = JWCG_DL.JO_WorkCentreGroupEdit(DS.Tables[0]).FirstOrDefault();
                    }
                }
            }

            List<JO_WorkCentreGroup_DTO> JWCG_List = JO_WorkCentreGroupGetData(SortOrder, Search, PageNumber, PSize, PageFilter, JWCG_DTO.JWCG_Number);
            return View(ViewPath, PaginatedList<JO_WorkCentreGroup_DTO>.CreateAsync(JWCG_List, DPageNumber ?? 1, DPageSize));
        }

        List<JO_WorkCentreGroup_DTO> JO_WorkCentreGroupGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter, Int64 EditNumber)
        {
            DPageSize = 10;

            JO_WorkCentreGroup_DTO JWCG_ListDTO = new JO_WorkCentreGroup_DTO();
            JWCG_ListDTO.JWCG_Id = 2;
            JWCG_ListDTO.JWCG_Number = EditNumber;
            JWCG_ListDTO.JWCG_CreatorCode = UserCode;
            DS = JWCG_DAO.JO_WorkCentreGroupDB(JWCG_ListDTO);

            List<JO_WorkCentreGroup_DTO> JWCG_List = JWCG_DL.JO_WorkCentreGroupList(DS.Tables[0]);
            ViewBag.Under = Help.GetUnder(DS.Tables[1]);

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

            var Key = JWCG_List.OrderByDescending(Cs => Cs.JWCG_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K => (K.JWCG_JW_WorkCentreGroup ?? "").ToLower().Contains(Search.ToLower()) || (K.JWCG_Description ?? "").ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.JWCG_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JWCG_JW_WorkCentreGroup!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JWCG_JW_WorkCentreGroup!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JWCG_Number);
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

        [Route("jobwork/master/jo-workcentregroup/duplicate")]
        public Boolean JO_WorkCentreGroupDuplicate(String? Title, String? Number)
        {
            JO_WorkCentreGroup_DTO JWCG_DTO = new JO_WorkCentreGroup_DTO();
            JWCG_DTO.JWCG_CreatorCode = UserCode;
            JWCG_DTO.JWCG_JW_WorkCentreGroup = Title;
            if (Convert.ToInt64(Number) == 0)
            {
                JWCG_DTO.JWCG_Id = 6;
            }
            else
            {
                JWCG_DTO.JWCG_Number = Convert.ToInt64(Number);
                JWCG_DTO.JWCG_Id = 7;
            }
            DS = JWCG_DAO.JO_WorkCentreGroupDB(JWCG_DTO);
            return DS.Tables[0].Rows.Count > 0;
        }
    }
}