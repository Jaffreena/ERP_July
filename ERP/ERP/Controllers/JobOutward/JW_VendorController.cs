using ERP.DataList;
using ERP.Models;
using ERP_DAO;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Data;
using System.Globalization;
using System.Transactions;

namespace ERP.Controllers.JobOutward
{
    public class JW_VendorController : Controller
    {
        const string ViewPath = "~/Views/JobworkOutward/JW_Vendor/JW_Vendor.cshtml";

        Int32? DPageNumber;
        Int32 DPageSize;
        Validation Valid = new Validation();
        DataSet DS = new DataSet();
        Help Help = new Help();

        JW_Vendor_DAO JWV_DAO = new JW_Vendor_DAO();
        JW_Vendor_DL JWV_DL = new JW_Vendor_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;

        #region Helpers
        JW_Vendor_DTO NewDTO(Int16 Id, Int64 Number = 0)
        {
            return new JW_Vendor_DTO { JWV_Id = Id, JWV_Number = Number, JWV_CreatorCode = UserCode };
        }

        static Int64 ToLong(String? S) => String.IsNullOrWhiteSpace(S) ? 0 : Convert.ToInt64(S);

        static Boolean IsBlank(String? S) => String.IsNullOrWhiteSpace(S) || S.Trim() == "0";

        // UI gives dd-MMM-yyyy, SP needs yyyy-MM-dd (same format for Save and Update)
        static String? ToDbDate(String? S)
        {
            if (String.IsNullOrWhiteSpace(S)) return null;
            if (DateTime.TryParse(S, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime D))
                return D.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            return null;
        }

        JW_Vendor_DTO MapHead(JW_VendorHead_DTO H, Int16 Id, Int64 Number)
        {
            JW_Vendor_DTO D = NewDTO(Id, Number);
            D.JWV_JW_VendorName = H.JWV_JW_VendorName;
            D.JWV_JVG_Number = H.JWV_JVG_Number ?? 0;
            D.JWV_JVC_Number = H.JWV_JVC_Number ?? 0;
            D.JWV_WH_Number = H.JWV_WH_Number ?? 0;
            D.JWV_PaymentTerms = H.JWV_PaymentTerms;
            D.JWV_PaymentMode = H.JWV_PaymentMode;
            D.JWV_CreditDays = H.JWV_CreditDays ?? 0;
            D.JWV_Currency_Number = H.JWV_Currency_Number ?? 0;
            D.JWV_AccountName = H.JWV_AccountName;
            D.JWV_AccountNumber = H.JWV_AccountNumber;
            D.JWV_IFSC = H.JWV_IFSC;
            D.JWV_BankName = H.JWV_BankName;
            D.JWV_RT_Number = H.JWV_RT_Number ?? 0;
            D.JWV_GSTIN = H.JWV_GSTIN;
            D.JWV_AT_Number = H.JWV_AT_Number ?? 0;
            D.JWV_TransportAgency = H.JWV_TransportAgency ?? 0;
            D.JWV_TransporterID = H.JWV_TransporterID;
            D.JWV_PAN = H.JWV_PAN;
            D.JWV_WithholdTax = H.JWV_WithholdTax ?? 0;
            D.JWV_AN_Number = H.JWV_AN_Number ?? 0;
            return D;
        }

        // Keep only real rows: not deleted and not completely empty
        void CleanGrids(JW_VendorHead_DTO H)
        {
            H.JWV_WHT_List = (H.JWV_WHT_List ?? new List<JW_VendorWHT_DTO>())
                .Where(x => x.JWV_WHT_IsDeleted != 1 &&
                            !(IsBlank(x.JWV_WHT_WHTC_Number) && IsBlank(x.JWV_WHT_WHTT_Number) && IsBlank(x.JWV_WHT_WHT_Number)
                              && String.IsNullOrWhiteSpace(x.JWV_WHT_FromDate) && String.IsNullOrWhiteSpace(x.JWV_WHT_ToDate)))
                .ToList();

            H.JWV_GST_List = (H.JWV_GST_List ?? new List<JW_VendorGST_DTO>())
                .Where(x => x.JWV_GST_IsDeleted != 1 &&
                            !(IsBlank(x.JWV_GST_GSTC_Number) && IsBlank(x.JWV_GST_GSTT_Number) && IsBlank(x.JWV_GST_TCT_Number)
                              && String.IsNullOrWhiteSpace(x.JWV_GST_FromDate) && String.IsNullOrWhiteSpace(x.JWV_GST_ToDate)))
                .ToList();

            H.JWV_Add_List = (H.JWV_Add_List ?? new List<JW_VendorAdd_DTO>())
                .Where(x => x.JWV_ADD_IsDeleted != 1 &&
                            !(x.JWV_ADD_ADTP_Number == 0 && String.IsNullOrWhiteSpace(x.JWV_ADD_Address_ID)
                              && String.IsNullOrWhiteSpace(x.JWV_ADD_Address) && String.IsNullOrWhiteSpace(x.JWV_ADD_City)
                              && String.IsNullOrWhiteSpace(x.JWV_ADD_State) && String.IsNullOrWhiteSpace(x.JWV_ADD_Country)
                              && String.IsNullOrWhiteSpace(x.JWV_ADD_PIN) && String.IsNullOrWhiteSpace(x.JWV_ADD_GSTIN)))
                .ToList();

            H.JWV_Contact_List = (H.JWV_Contact_List ?? new List<JW_VendorContact_DTO>())
                .Where(x => x.JWV_CNT_IsDeleted != 1 &&
                            !(String.IsNullOrWhiteSpace(x.JWV_CNT_ContactName) && String.IsNullOrWhiteSpace(x.JWV_CNT_Department)
                              && String.IsNullOrWhiteSpace(x.JWV_CNT_Mobile) && String.IsNullOrWhiteSpace(x.JWV_CNT_Telephone)
                              && String.IsNullOrWhiteSpace(x.JWV_CNT_Email)))
                .ToList();
        }

        // Insert new rows (Number == 0) / update existing rows
        void SaveGrids(JW_VendorHead_DTO H, Int64 VendorNo)
        {
            foreach (var W in H.JWV_WHT_List!)
            {
                JW_Vendor_DTO D = NewDTO(W.JWV_WHT_Number == 0 ? (Int16)3 : (Int16)15, VendorNo);
                D.JWV_WHT_Number = W.JWV_WHT_Number;
                D.JWV_WHT_WHTC_Number = ToLong(W.JWV_WHT_WHTC_Number);
                D.JWV_WHT_WHTT_Number = ToLong(W.JWV_WHT_WHTT_Number);
                D.JWV_WHT_WHT_Number = ToLong(W.JWV_WHT_WHT_Number);
                D.JWV_WHT_FromDate = ToDbDate(W.JWV_WHT_FromDate);
                D.JWV_WHT_ToDate = ToDbDate(W.JWV_WHT_ToDate);
                JWV_DAO.JW_VendorDB(D);
            }

            foreach (var G in H.JWV_GST_List!)
            {
                JW_Vendor_DTO D = NewDTO(G.JWV_GST_Number == 0 ? (Int16)4 : (Int16)16, VendorNo);
                D.JWV_GST_Number = G.JWV_GST_Number;
                D.JWV_GST_GSTC_Number = ToLong(G.JWV_GST_GSTC_Number);
                D.JWV_GST_GSTT_Number = ToLong(G.JWV_GST_GSTT_Number);
                D.JWV_GST_TCT_Number = ToLong(G.JWV_GST_TCT_Number);
                D.JWV_GST_FromDate = ToDbDate(G.JWV_GST_FromDate);
                D.JWV_GST_ToDate = ToDbDate(G.JWV_GST_ToDate);
                JWV_DAO.JW_VendorDB(D);
            }

            foreach (var A in H.JWV_Add_List!)
            {
                JW_Vendor_DTO D = NewDTO(A.JWV_ADD_Number == 0 ? (Int16)10 : (Int16)17, VendorNo);
                D.JWV_ADD_Number = A.JWV_ADD_Number;
                D.JWV_ADD_ADTP_Number = A.JWV_ADD_ADTP_Number;
                D.JWV_ADD_Address_ID = A.JWV_ADD_Address_ID;
                D.JWV_ADD_Address = A.JWV_ADD_Address;
                D.JWV_ADD_City = A.JWV_ADD_City;
                D.JWV_ADD_State = A.JWV_ADD_State;
                D.JWV_ADD_Country = A.JWV_ADD_Country;
                D.JWV_ADD_PIN = A.JWV_ADD_PIN;
                D.JWV_ADD_GSTIN = A.JWV_ADD_GSTIN;
                D.JWV_ADD_Default = A.JWV_ADD_Default ? (Int16)1 : (Int16)0;
                JWV_DAO.JW_VendorDB(D);
            }

            foreach (var C in H.JWV_Contact_List!)
            {
                JW_Vendor_DTO D = NewDTO(C.JWV_CNT_Number == 0 ? (Int16)24 : (Int16)25, VendorNo);
                D.JWV_CNT_Number = C.JWV_CNT_Number;
                D.JWV_CNT_ContactName = C.JWV_CNT_ContactName;
                D.JWV_CNT_Department = C.JWV_CNT_Department;
                D.JWV_CNT_Mobile = C.JWV_CNT_Mobile;
                D.JWV_CNT_Telephone = C.JWV_CNT_Telephone;
                D.JWV_CNT_Email = C.JWV_CNT_Email;
                JWV_DAO.JW_VendorDB(D);
            }
        }

        // returns error message, or null when saved
        String? SaveVendor(JW_VendorHead_DTO H)
        {
            using (var Scope = new TransactionScope())
            {
                DS = JWV_DAO.JW_VendorDB(MapHead(H, 1, 0));
                if (DS.Tables[0].Rows.Count > 0)
                    return "Vendor Name already exists. Please check";

                DS = JWV_DAO.JW_VendorDB(MapHead(H, 2, 0));
                if (DS.Tables.Count == 0 || DS.Tables[0].Rows.Count == 0)
                    return "Failed to insert Vendor";

                Int64 VendorNo = Convert.ToInt64(DS.Tables[0].Rows[0][0]);
                SaveGrids(H, VendorNo);

                Scope.Complete();
                return null;
            }
        }

        String? UpdateVendor(JW_VendorHead_DTO H)
        {
            using (var Scope = new TransactionScope())
            {
                Int64 VendorNo = H.JWV_Number;

                DS = JWV_DAO.JW_VendorDB(MapHead(H, 6, VendorNo));
                if (DS.Tables[0].Rows.Count > 0)
                    return "Vendor Name already exists. Please check";

                // delete grid rows that are no longer in the list
                JW_Vendor_DTO D = NewDTO(12, VendorNo);
                D.JWV_DeleteNumbers = String.Join(",", H.JWV_GST_List!.Where(x => x.JWV_GST_Number != 0).Select(x => x.JWV_GST_Number));
                JWV_DAO.JW_VendorDB(D);

                D = NewDTO(13, VendorNo);
                D.JWV_DeleteNumbers = String.Join(",", H.JWV_WHT_List!.Where(x => x.JWV_WHT_Number != 0).Select(x => x.JWV_WHT_Number));
                JWV_DAO.JW_VendorDB(D);

                D = NewDTO(18, VendorNo);
                D.JWV_DeleteNumbers = String.Join(",", H.JWV_Add_List!.Where(x => x.JWV_ADD_Number != 0).Select(x => x.JWV_ADD_Number));
                JWV_DAO.JW_VendorDB(D);

                D = NewDTO(29, VendorNo);
                D.JWV_DeleteNumbers = String.Join(",", H.JWV_Contact_List!.Where(x => x.JWV_CNT_Number != 0).Select(x => x.JWV_CNT_Number));
                JWV_DAO.JW_VendorDB(D);

                JWV_DAO.JW_VendorDB(MapHead(H, 14, VendorNo));
                SaveGrids(H, VendorNo);

                Scope.Complete();
                return null;
            }
        }

        String ModelErrors()
        {
            var Errors = ModelState.SelectMany(m => m.Value!.Errors.Select(s => s.ErrorMessage));
            return String.Join("<br/>", Errors);
        }
        #endregion

        #region AJAX
        [Route("jobwork/master/jw-vendor/whtgrid")]
        public IActionResult JW_VendorGridWHT(String? categoryId, String? typeId)
        {
            JW_Vendor_DTO D = NewDTO(26);
            D.WH_TaxCategory = String.IsNullOrEmpty(categoryId) ? "" : categoryId;
            D.WH_TaxType = String.IsNullOrEmpty(typeId) ? "" : typeId;
            DS = JWV_DAO.JW_VendorDB(D);
            return Json(JWV_DL.JW_VendorWHTGridTaxCode(DS.Tables[0]));
        }

        [Route("jobwork/master/jw-vendor/gstgrid")]
        public IActionResult JW_VendorGridGST(String? categoryId, String? typeId)
        {
            JW_Vendor_DTO D = NewDTO(27);
            D.GST_Category = String.IsNullOrEmpty(categoryId) ? "" : categoryId;
            D.GST_Type = String.IsNullOrEmpty(typeId) ? "" : typeId;
            DS = JWV_DAO.JW_VendorDB(D);
            return Json(JWV_DL.JW_VendorGSTGridTaxCluster(DS.Tables[0]));
        }

        [Route("jobwork/master/jw-vendor/duplicate")]
        public Boolean JW_VendorDuplicate(String? Title, String? Number)
        {
            JW_Vendor_DTO D = NewDTO(5);
            D.JWV_JW_VendorName = Title;
            if (Convert.ToInt64(String.IsNullOrEmpty(Number) ? "0" : Number) != 0)
            {
                D.JWV_Id = 6;
                D.JWV_Number = Convert.ToInt64(Number);
            }
            DS = JWV_DAO.JW_VendorDB(D);
            return DS.Tables[0].Rows.Count > 0;
        }
        #endregion

        [Route("jobwork/master/jw-vendor")]
        public IActionResult JW_Vendor(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            List<JW_VendorList_DTO> VList = JW_VendorGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            var PageList = PaginatedList_DTO<JW_VendorList_DTO>.CreateAsync(VList, DPageNumber ?? 1, DPageSize);

            var Model = new JW_VendorHead_DTO() { JW_Vendor_List = PageList };
            return View(ViewPath, Model);
        }

        [Route("jobwork/master/jw-vendor")]
        [HttpPost]
        public IActionResult JW_Vendor(JW_VendorHead_DTO BH_DTO, Int64? Number, String? DeleteNumbers, String? Mode, String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            // copy of what the user typed (re-shown when save/update fails)
            var Original_BH_DTO = Help.JsonClone(BH_DTO);
            JW_VendorHead_DTO B_Head_DTO = BH_DTO;

            if (Mode == "Save")
            {
                ModelState.Clear();
                CleanGrids(BH_DTO);

                if (TryValidateModel(BH_DTO))
                {
                    try
                    {
                        String? Error = SaveVendor(BH_DTO);
                        if (Error == null)
                        {
                            BH_DTO.Reset();
                            Original_BH_DTO = Help.JsonClone(BH_DTO);
                            ModelState.Clear();
                        }
                        else
                        {
                            ViewBag.ErrorCode = 2;
                            ViewBag.ErrorMessage = Error;
                        }
                    }
                    catch (Exception ex)
                    {
                        ViewBag.ErrorCode = 2;
                        ViewBag.ErrorMessage = Valid.CatchValid(ex.Message);
                    }
                }
                else
                {
                    ViewBag.ErrorCode = 2;
                    ViewBag.ErrorMessage = ModelErrors();
                }
            }
            else if (Mode == "Update")
            {
                ModelState.Clear();
                CleanGrids(BH_DTO);

                if (TryValidateModel(BH_DTO))
                {
                    try
                    {
                        String? Error = UpdateVendor(BH_DTO);
                        if (Error == null)
                        {
                            BH_DTO.Reset();
                            Original_BH_DTO = Help.JsonClone(BH_DTO);
                            ModelState.Clear();
                        }
                        else
                        {
                            ViewBag.ErrorCode = 2;
                            ViewBag.ErrorMessage = Error;
                        }
                    }
                    catch (Exception ex)
                    {
                        ViewBag.ErrorCode = 2;
                        ViewBag.ErrorMessage = Valid.CatchValid(ex.Message);
                    }
                }
                else
                {
                    ViewBag.ErrorCode = 2;
                    ViewBag.ErrorMessage = ModelErrors();
                }
            }
            else if (Mode == "DeleteAll")
            {
                try
                {
                    JW_Vendor_DTO D = NewDTO(23);
                    D.JWV_DeleteNumbers = DeleteNumbers;
                    JWV_DAO.JW_VendorDB(D);

                    B_Head_DTO = new JW_VendorHead_DTO();
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
                    JWV_DAO.JW_VendorDB(NewDTO(22, Convert.ToInt64(Number)));

                    B_Head_DTO = new JW_VendorHead_DTO();
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
                B_Head_DTO = new JW_VendorHead_DTO();
                ModelState.Clear();
            }
            else if (Mode == "Edit")
            {
                DS = JWV_DAO.JW_VendorDB(NewDTO(11, BH_DTO.JWV_Number));
                if (DS.Tables[0].Rows.Count > 0)
                {
                    B_Head_DTO = JWV_DL.JW_VendorHeadList(DS.Tables[0]).First();
                    B_Head_DTO.JWV_Add_List = JWV_DL.JW_VendorAddList(DS.Tables[1]);
                    B_Head_DTO.JWV_Contact_List = JWV_DL.JW_VendorContactList(DS.Tables[2]);
                    B_Head_DTO.JWV_WHT_List = JWV_DL.JW_VendorWHTList(DS.Tables[3]);
                    B_Head_DTO.JWV_GST_List = JWV_DL.JW_VendorGSTList(DS.Tables[4]);
                }
                else
                {
                    B_Head_DTO = new JW_VendorHead_DTO();
                    ViewBag.ErrorCode = 2;
                    ViewBag.ErrorMessage = "Vendor not found or already in use";
                }
                ModelState.Clear();
            }

            List<JW_VendorList_DTO> VList = JW_VendorGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            var PageList = PaginatedList_DTO<JW_VendorList_DTO>.CreateAsync(VList, DPageNumber ?? 1, DPageSize);

            if (Mode == "Save" || Mode == "Update")
            {
                Original_BH_DTO.JW_Vendor_List = PageList;
                return View(ViewPath, Original_BH_DTO);
            }

            B_Head_DTO.JW_Vendor_List = PageList;
            return View(ViewPath, B_Head_DTO);
        }

        List<JW_VendorList_DTO> JW_VendorGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            DPageSize = 10;

            DS = JWV_DAO.JW_VendorDB(NewDTO(21));
            List<JW_VendorList_DTO> VList = JWV_DL.JW_VendorList(DS.Tables[0]);

            ViewBag.VendorGroup = Help.GetCat(DS.Tables[1]);
            ViewBag.VendorCategory = Help.GetCat(DS.Tables[2]);
            ViewBag.Registration = Help.GetCat(DS.Tables[3]);
            ViewBag.Currency = Help.GetCat(DS.Tables[4]);
            ViewBag.NatureOfAssessee = Help.GetCat(DS.Tables[5]);
            ViewBag.WHT_Category = Help.GetCat(DS.Tables[6]);
            ViewBag.WHT_Type = Help.GetCat(DS.Tables[7]);
            ViewBag.WHT_Tax = Help.GetCat(DS.Tables[8]);
            ViewBag.GST_Type = Help.GetCat(DS.Tables[9]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[10]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[11]);
            ViewBag.GST_Category = Help.GetCat(DS.Tables[12]);
            ViewBag.GST_TaxCluster = Help.GetCat(DS.Tables[13]);
            ViewBag.AssesseeTerritory = Help.GetCat(DS.Tables[14]);

            // fixed Yes / No (saved as 1 / 0)
            ViewBag.YesNo = new List<SelectListItem>
            {
                new SelectListItem { Text = "No", Value = "0" },
                new SelectListItem { Text = "Yes", Value = "1" }
            };

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

            var Key = VList.OrderByDescending(Cs => Cs.JWV_Number);
            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K => (K.JWV_JW_VendorName ?? "").ToLower().Contains(Search.ToLower())).OrderByDescending(Cs => Cs.JWV_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JWV_JW_VendorName!);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JWV_JW_VendorName!);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JWV_Number);
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
            ViewData["TotalSize"] = Record;

            return Key.ToList();
        }
    }
}