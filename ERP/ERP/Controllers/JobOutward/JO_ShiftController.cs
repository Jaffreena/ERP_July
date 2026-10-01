using ERP.DataList;
using ERP.Models;
using ERP_DAO;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using ERP_DAO.JobOutwardTransaction;
using System.Data;

namespace ERP.Controllers.JobOutward
{
    public class JO_ShiftController : Controller
    {
        const string ViewPath = "~/Views/JobworkOutward/JO_Shift/JO_Shift.cshtml";

        Int32? DPageNumber;
        Int32 DPageSize;
        Validation Valid = new Validation();
        DataSet DS = new DataSet();
        Help Help = new Help();

        JO_Shift_DAO JSFT_DAO = new JO_Shift_DAO();
        JO_Shift_DL JSFT_DL = new JO_Shift_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;

        [Route("jobwork/master/jo-shift")]
        public IActionResult JO_Shift(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            List<JO_Shift_DTO> JSFT_List = JO_ShiftGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(ViewPath, PaginatedList<JO_Shift_DTO>.CreateAsync(JSFT_List, DPageNumber ?? 1, DPageSize));
        }

        [Route("jobwork/master/jo-shift")]
        [HttpPost]
        public IActionResult JO_Shift(JO_Shift_DTO JSFT_DTO, String? DeleteNumbers, Int64 Number, String? Mode, String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            JSFT_DTO.JSFT_CreatorCode = UserCode;

            if (Mode == "Save")
            {
                if (ModelState.IsValid)
                {
                    JSFT_DTO.JSFT_Id = 6;
                    DS = JSFT_DAO.JO_ShiftDB(JSFT_DTO);
                    if (DS.Tables[0].Rows.Count == 0)
                    {
                        JSFT_DTO.JSFT_Id = 1;
                        JSFT_DAO.JO_ShiftDB(JSFT_DTO);

                        JSFT_DTO.Reset();
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
                    JSFT_DTO.JSFT_DeleteNumbers = DeleteNumbers;
                    JSFT_DTO.JSFT_Id = 3;
                    JSFT_DAO.JO_ShiftDB(JSFT_DTO);

                    JSFT_DTO.Reset();
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
                    JSFT_DTO.JSFT_Number = Number;
                    JSFT_DTO.JSFT_Id = 8;
                    JSFT_DAO.JO_ShiftDB(JSFT_DTO);

                    JSFT_DTO.Reset();
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
                JSFT_DTO.Reset();
                ModelState.Clear();
            }
            else if (Mode == "Edit")
            {
                JSFT_DTO.JSFT_Id = 4;
                DS = JSFT_DAO.JO_ShiftDB(JSFT_DTO);
                ViewBag.JO_ShiftEdit = JSFT_DL.JO_ShiftEdit(DS.Tables[0]).FirstOrDefault();
            }
            else if (Mode == "Update")
            {
                JSFT_DTO.JSFT_Id = 7;
                DS = JSFT_DAO.JO_ShiftDB(JSFT_DTO);
                if (DS.Tables[0].Rows.Count == 0)
                {
                    if (ModelState.IsValid)
                    {
                        JSFT_DTO.JSFT_Id = 5;
                        JSFT_DAO.JO_ShiftDB(JSFT_DTO);

                        JSFT_DTO.Reset();
                        ModelState.Clear();
                    }
                    else
                    {
                        var Errors = ModelState.SelectMany(m => m.Value!.Errors.Select(s => new { s.ErrorMessage })).Select(p => p.ErrorMessage);
                        string CombinedString = string.Join("<br/>", Errors);

                        ViewBag.ErrorCode = 2;
                        ViewBag.ErrorMessage = CombinedString;

                        JSFT_DTO.JSFT_Id = 4;
                        DS = JSFT_DAO.JO_ShiftDB(JSFT_DTO);
                        ViewBag.JO_ShiftEdit = JSFT_DL.JO_ShiftEdit(DS.Tables[0]).FirstOrDefault();
                    }
                }
            }

            List<JO_Shift_DTO> JSFT_List = JO_ShiftGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(ViewPath, PaginatedList<JO_Shift_DTO>.CreateAsync(JSFT_List, DPageNumber ?? 1, DPageSize));
        }

        List<JO_Shift_DTO> JO_ShiftGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            DPageSize = 10;

            JO_Shift_DTO JSFT_ListDTO = new JO_Shift_DTO();
            JSFT_ListDTO.JSFT_Id = 2;
            JSFT_ListDTO.JSFT_CreatorCode = UserCode;
            DS = JSFT_DAO.JO_ShiftDB(JSFT_ListDTO);

            List<JO_Shift_DTO> JSFT_List = JSFT_DL.JO_ShiftList(DS.Tables[0]);

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

            var Key = JSFT_List.OrderByDescending(Cs => Cs.JSFT_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K => (K.JSFT_ShiftName ?? "").ToLower().Contains(Search.ToLower()) || (K.JSFT_Description ?? "").ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.JSFT_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JSFT_ShiftName!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JSFT_ShiftName!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JSFT_Number);
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

        [Route("jobwork/master/jo-shift/duplicate")]
        public Boolean JO_ShiftDuplicate(String? Title, String? Number)
        {
            JO_Shift_DTO JSFT_DTO = new JO_Shift_DTO();
            JSFT_DTO.JSFT_CreatorCode = UserCode;
            JSFT_DTO.JSFT_ShiftName = Title;
            if (Convert.ToInt64(Number) == 0)
            {
                JSFT_DTO.JSFT_Id = 6;
            }
            else
            {
                JSFT_DTO.JSFT_Number = Convert.ToInt64(Number);
                JSFT_DTO.JSFT_Id = 7;
            }
            DS = JSFT_DAO.JO_ShiftDB(JSFT_DTO);
            return DS.Tables[0].Rows.Count > 0;
        }
    }
}