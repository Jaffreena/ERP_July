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
    public class JW_VendorGroupController : Controller
    {
        const string ViewPath = "~/Views/JobworkOutward/JW_VendorGroup/JW_VendorGroup.cshtml";

        Int32? DPageNumber;
        Int32 DPageSize;
        Validation Valid = new Validation();
        DataSet DS = new DataSet();
        Help Help = new Help();

        JW_VendorGroup_DAO JVG_DAO = new JW_VendorGroup_DAO();
        JW_VendorGroup_DL JVG_DL = new JW_VendorGroup_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;

        [Route("jobwork/master/jw-vendorgroup")]
        public IActionResult JW_VendorGroup(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            List<JW_VendorGroup_DTO> JVG_List = JW_VendorGroupGetData(SortOrder, Search, PageNumber, PSize, PageFilter, 0);
            return View(ViewPath, PaginatedList<JW_VendorGroup_DTO>.CreateAsync(JVG_List, DPageNumber ?? 1, DPageSize));
        }

        [Route("jobwork/master/jw-vendorgroup")]
        [HttpPost]
        public IActionResult JW_VendorGroup(JW_VendorGroup_DTO JVG_DTO, String? DeleteNumbers, Int64 Number, String? Mode, String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            JVG_DTO.JVG_CreatorCode = UserCode;

            if (Mode == "Save")
            {
                if (ModelState.IsValid)
                {
                    JVG_DTO.JVG_Id = 6;
                    DS = JVG_DAO.JW_VendorGroupDB(JVG_DTO);
                    if (DS.Tables[0].Rows.Count == 0)
                    {
                        JVG_DTO.JVG_Id = 1;
                        JVG_DAO.JW_VendorGroupDB(JVG_DTO);

                        JVG_DTO.Reset();
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
                    JVG_DTO.JVG_DeleteNumbers = DeleteNumbers;
                    JVG_DTO.JVG_Id = 3;
                    JVG_DAO.JW_VendorGroupDB(JVG_DTO);

                    JVG_DTO.Reset();
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
                    JVG_DTO.JVG_Number = Number;
                    JVG_DTO.JVG_Id = 8;
                    JVG_DAO.JW_VendorGroupDB(JVG_DTO);

                    JVG_DTO.Reset();
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
                JVG_DTO.Reset();
                ModelState.Clear();
            }
            else if (Mode == "Edit")
            {
                JVG_DTO.JVG_Id = 4;
                DS = JVG_DAO.JW_VendorGroupDB(JVG_DTO);
                ViewBag.JW_VendorGroupEdit = JVG_DL.JW_VendorGroupEdit(DS.Tables[0]).FirstOrDefault();
            }
            else if (Mode == "Update")
            {
                JVG_DTO.JVG_Id = 7;
                DS = JVG_DAO.JW_VendorGroupDB(JVG_DTO);
                if (DS.Tables[0].Rows.Count == 0)
                {
                    if (ModelState.IsValid)
                    {
                        JVG_DTO.JVG_Id = 5;
                        JVG_DAO.JW_VendorGroupDB(JVG_DTO);

                        JVG_DTO.Reset();
                        ModelState.Clear();
                    }
                    else
                    {
                        var Errors = ModelState.SelectMany(m => m.Value!.Errors.Select(s => new { s.ErrorMessage })).Select(p => p.ErrorMessage);
                        string CombinedString = string.Join("<br/>", Errors);

                        ViewBag.ErrorCode = 2;
                        ViewBag.ErrorMessage = CombinedString;

                        JVG_DTO.JVG_Id = 4;
                        DS = JVG_DAO.JW_VendorGroupDB(JVG_DTO);
                        ViewBag.JW_VendorGroupEdit = JVG_DL.JW_VendorGroupEdit(DS.Tables[0]).FirstOrDefault();
                    }
                }
            }

            List<JW_VendorGroup_DTO> JVG_List = JW_VendorGroupGetData(SortOrder, Search, PageNumber, PSize, PageFilter, JVG_DTO.JVG_Number);
            return View(ViewPath, PaginatedList<JW_VendorGroup_DTO>.CreateAsync(JVG_List, DPageNumber ?? 1, DPageSize));
        }

        List<JW_VendorGroup_DTO> JW_VendorGroupGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter, Int64 EditNumber)
        {
            DPageSize = 10;

            JW_VendorGroup_DTO JVG_ListDTO = new JW_VendorGroup_DTO();
            JVG_ListDTO.JVG_Id = 2;
            JVG_ListDTO.JVG_Number = EditNumber;
            JVG_ListDTO.JVG_CreatorCode = UserCode;
            DS = JVG_DAO.JW_VendorGroupDB(JVG_ListDTO);

            List<JW_VendorGroup_DTO> JVG_List = JVG_DL.JW_VendorGroupList(DS.Tables[0]);
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

            var Key = JVG_List.OrderByDescending(Cs => Cs.JVG_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K => (K.JVG_JW_VendorGroup ?? "").ToLower().Contains(Search.ToLower()) || (K.JVG_Description ?? "").ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.JVG_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JVG_JW_VendorGroup!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JVG_JW_VendorGroup!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JVG_Number);
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

        [Route("jobwork/master/jw-vendorgroup/duplicate")]
        public Boolean JW_VendorGroupDuplicate(String? Title, String? Number)
        {
            JW_VendorGroup_DTO JVG_DTO = new JW_VendorGroup_DTO();
            JVG_DTO.JVG_CreatorCode = UserCode;
            JVG_DTO.JVG_JW_VendorGroup = Title;
            if (Convert.ToInt64(Number) == 0)
            {
                JVG_DTO.JVG_Id = 6;
            }
            else
            {
                JVG_DTO.JVG_Number = Convert.ToInt64(Number);
                JVG_DTO.JVG_Id = 7;
            }
            DS = JVG_DAO.JW_VendorGroupDB(JVG_DTO);
            return DS.Tables[0].Rows.Count > 0;
        }
    }
}