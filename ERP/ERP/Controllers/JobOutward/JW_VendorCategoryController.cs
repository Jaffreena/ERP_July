using Microsoft.AspNetCore.Mvc;
using ERP_DAO.JobOutwardTransaction;
using ERP.Models;
using ERP_DAO;
using ERP_DL;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobOutward
{
    public class JW_VendorCategoryController : Controller
    {
        const string ViewPath = "~/Views/JobworkOutward/JW_VendorCategory/JW_VendorCategory.cshtml";

        Int32? DPageNumber;
        Int32 DPageSize;
        Validation Valid = new Validation();
        DataSet DS = new DataSet();
        Help Help = new Help();

        JW_VendorCategory_DAO JVC_DAO = new JW_VendorCategory_DAO();
        JW_VendorCategory_DL JVC_DL = new JW_VendorCategory_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;

        [Route("jobwork/master/jw-vendorcategory")]
        public IActionResult JW_VendorCategory(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            List<JW_VendorCategory_DTO> JVC_List = JW_VendorCategoryGetData(SortOrder, Search, PageNumber, PSize, PageFilter, 0);
            return View(ViewPath, PaginatedList<JW_VendorCategory_DTO>.CreateAsync(JVC_List, DPageNumber ?? 1, DPageSize));
        }

        [Route("jobwork/master/jw-vendorcategory")]
        [HttpPost]
        public IActionResult JW_VendorCategory(JW_VendorCategory_DTO JVC_DTO, String? DeleteNumbers, Int64 Number, String? Mode, String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            JVC_DTO.JVC_CreatorCode = UserCode;

            if (Mode == "Save")
            {
                if (ModelState.IsValid)
                {
                    JVC_DTO.JVC_Id = 6;
                    DS = JVC_DAO.JW_VendorCategoryDB(JVC_DTO);
                    if (DS.Tables[0].Rows.Count == 0)
                    {
                        JVC_DTO.JVC_Id = 1;
                        JVC_DAO.JW_VendorCategoryDB(JVC_DTO);

                        JVC_DTO.Reset();
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
                    JVC_DTO.JVC_DeleteNumbers = DeleteNumbers;
                    JVC_DTO.JVC_Id = 3;
                    JVC_DAO.JW_VendorCategoryDB(JVC_DTO);

                    JVC_DTO.Reset();
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
                    JVC_DTO.JVC_Number = Number;
                    JVC_DTO.JVC_Id = 8;
                    JVC_DAO.JW_VendorCategoryDB(JVC_DTO);

                    JVC_DTO.Reset();
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
                JVC_DTO.Reset();
                ModelState.Clear();
            }
            else if (Mode == "Edit")
            {
                JVC_DTO.JVC_Id = 4;
                DS = JVC_DAO.JW_VendorCategoryDB(JVC_DTO);
                ViewBag.JW_VendorCategoryEdit = JVC_DL.JW_VendorCategoryEdit(DS.Tables[0]).FirstOrDefault();
            }
            else if (Mode == "Update")
            {
                JVC_DTO.JVC_Id = 7;
                DS = JVC_DAO.JW_VendorCategoryDB(JVC_DTO);
                if (DS.Tables[0].Rows.Count == 0)
                {
                    if (ModelState.IsValid)
                    {
                        JVC_DTO.JVC_Id = 5;
                        JVC_DAO.JW_VendorCategoryDB(JVC_DTO);

                        JVC_DTO.Reset();
                        ModelState.Clear();
                    }
                    else
                    {
                        var Errors = ModelState.SelectMany(m => m.Value!.Errors.Select(s => new { s.ErrorMessage })).Select(p => p.ErrorMessage);
                        string CombinedString = string.Join("<br/>", Errors);

                        ViewBag.ErrorCode = 2;
                        ViewBag.ErrorMessage = CombinedString;

                        JVC_DTO.JVC_Id = 4;
                        DS = JVC_DAO.JW_VendorCategoryDB(JVC_DTO);
                        ViewBag.JW_VendorCategoryEdit = JVC_DL.JW_VendorCategoryEdit(DS.Tables[0]).FirstOrDefault();
                    }
                }
            }

            List<JW_VendorCategory_DTO> JVC_List = JW_VendorCategoryGetData(SortOrder, Search, PageNumber, PSize, PageFilter, JVC_DTO.JVC_Number);
            return View(ViewPath, PaginatedList<JW_VendorCategory_DTO>.CreateAsync(JVC_List, DPageNumber ?? 1, DPageSize));
        }

        List<JW_VendorCategory_DTO> JW_VendorCategoryGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter, Int64 EditNumber)
        {
            DPageSize = 10;

            JW_VendorCategory_DTO JVC_ListDTO = new JW_VendorCategory_DTO();
            JVC_ListDTO.JVC_Id = 2;
            JVC_ListDTO.JVC_Number = EditNumber;
            JVC_ListDTO.JVC_CreatorCode = UserCode;
            DS = JVC_DAO.JW_VendorCategoryDB(JVC_ListDTO);

            List<JW_VendorCategory_DTO> JVC_List = JVC_DL.JW_VendorCategoryList(DS.Tables[0]);
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

            var Key = JVC_List.OrderByDescending(Cs => Cs.JVC_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K => (K.JVC_JW_VendorCategory ?? "").ToLower().Contains(Search.ToLower()) || (K.JVC_Description ?? "").ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.JVC_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JVC_JW_VendorCategory!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JVC_JW_VendorCategory!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JVC_Number);
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

        [Route("jobwork/master/jw-vendorcategory/duplicate")]
        public Boolean JW_VendorCategoryDuplicate(String? Title, String? Number)
        {
            JW_VendorCategory_DTO JVC_DTO = new JW_VendorCategory_DTO();
            JVC_DTO.JVC_CreatorCode = UserCode;
            JVC_DTO.JVC_JW_VendorCategory = Title;
            if (Convert.ToInt64(Number) == 0)
            {
                JVC_DTO.JVC_Id = 6;
            }
            else
            {
                JVC_DTO.JVC_Number = Convert.ToInt64(Number);
                JVC_DTO.JVC_Id = 7;
            }
            DS = JVC_DAO.JW_VendorCategoryDB(JVC_DTO);
            return DS.Tables[0].Rows.Count > 0;
        }
    }
}
