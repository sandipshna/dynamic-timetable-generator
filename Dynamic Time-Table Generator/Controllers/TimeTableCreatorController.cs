using Dynamic_Time_Table_Generator.Models;
using Dynamic_Time_Table_Generator.Models.RequestModel;
using Dynamic_Time_Table_Generator.Models.ResponseModel;
using Dynamic_Time_Table_Generator.Models.ValueContainerModel;
using Microsoft.AspNetCore.Mvc;

namespace Dynamic_Time_Table_Generator.Controllers
{
    public class TimeTableCreatorController : Controller
    {
        public static List<SubjectViewModel> subjectViewModels;
        public static InitialSubjectInputsDTO initialSubjectInputs;
        public IActionResult ProjectInformation()
        {
            return View();
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public async Task<IActionResult> GetSubject()
        {
            subjectViewModels = new List<SubjectViewModel>()
            {
                {new SubjectViewModel() { SubjectName ="Gujarati" } },
                {new SubjectViewModel() { SubjectName ="Maths" } },
                {new SubjectViewModel() { SubjectName ="English" } },
                {new SubjectViewModel() { SubjectName ="Science" } },
                {new SubjectViewModel() { SubjectName ="Hindi" } },
                {new SubjectViewModel() { SubjectName ="C++" } }
            };

            return Json(subjectViewModels);
        }
        [HttpGet]
        public async Task<IActionResult> GetAfterSelectionOfSubject()
        {
            return Json(subjectViewModels);
        }
        [HttpPost]
        public async Task<IActionResult> GetTotalHoursForWeek([FromForm]InitialSubjectInputsDTO initialSubjectInputsDTO)
        {
            initialSubjectInputs = initialSubjectInputsDTO;
            var totalHoursForWeek = initialSubjectInputsDTO.workingDays * initialSubjectInputsDTO.noOfSubjectDayWise;
            Random rand = new Random();
            subjectViewModels = subjectViewModels.OrderBy(x => rand.Next()).Take(initialSubjectInputsDTO.totalSubjects).ToList();

            return Json(new { subject = subjectViewModels , hours = totalHoursForWeek  });
        }
        [HttpPost]
        public async Task<IActionResult> CreateTable([FromBody] List<SubjectHoursDTO> subjectHoursDTOs)
        {
            Random rnd = new Random();
            List<PerDayWiseTimeTableCreatorDTO> pardayTimeTable = new List<PerDayWiseTimeTableCreatorDTO>();
            for (int days = 0; days < initialSubjectInputs.workingDays; days++) 
            {
                var perdayTimeTableObject = new PerDayWiseTimeTableCreatorDTO();
                var subjectNameList = new List<string>();
                for (int daywisesubject = 0; daywisesubject < initialSubjectInputs.noOfSubjectDayWise; daywisesubject++)
                {
                    int index = rnd.Next(subjectHoursDTOs.Count);
                    if (subjectHoursDTOs[index].subjectHours == 0)
                    {
                        subjectHoursDTOs.RemoveAt(index);
                        daywisesubject--;
                        continue;
                    }
                    subjectNameList.Add(subjectHoursDTOs[index].subjectName);
                    subjectHoursDTOs[index].subjectHours--;
                }
                perdayTimeTableObject.SubjectName = subjectNameList;
                pardayTimeTable.Add(perdayTimeTableObject);
            }
            return Json(pardayTimeTable);
        }

    }
}
