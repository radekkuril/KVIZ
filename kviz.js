
    let currentRound = 0;
    let startTime;
    const container = document.getElementById('quiz-container');
    const timerEl = document.getElementById('timer');
    var round,errors=0,seconds,draggedObject;
    const clFill = '#0E3A2F',clColor = "rgb(120, 250, 174)",clAllowDrop = "rgb(220, 220, 220)";

    document.getElementById('start-btn').onclick = () => {
      document.getElementById('start-btn').style.display = 'none';
      container.style.display = 'block';
      startTime = new Date();
      updateTimer();
      startRound();
    };

    function updateTimer() {
      const now = new Date();
      seconds = Math.floor((now - startTime) / 1000);
      timerEl.textContent = `Čas: ${seconds} sekund, počet chyb: ${errors}`;
      requestAnimationFrame(updateTimer);
    }

    function startRound() {
      container.innerHTML = '';
      round = quizData[currentRound];
      const title = document.createElement('h2');
      title.textContent = round.title;
      container.appendChild(title);

      if (round.questions) {
        round.questions.forEach((q, index) => {
          const block = document.createElement('div');
          block.className = 'question-block';
          
          const question = document.createElement('div');
          question.className = 'question';
          question.textContent = q.question;
          block.appendChild(question);

          q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = "btn" + ((i === q.answer) ? " rightAnswer" : "");
            btn.textContent = opt;
            btn.onclick = () => {
              if (i === q.answer) {
                btn.style.backgroundColor = clColor;
                btn.style.color = clFill;
                btn.disabled = true;
                if (checkAllCorrect(container)){
                    nextRound();
                } 
              } else {
                btn.style.backgroundColor = 'red';
                errors++;
              }
            };
            block.appendChild(btn);
          });
          container.appendChild(block);
        });
      } else if (round.type === 'match') {
        const entries = Object.entries(round.pairs);
        var div1;
        round.pairs.forEach((objekt, index) => {
          const div = document.createElement('div');
          div.className = 'question-block';
          if(objekt.img){        //je tam odkaz na obrázek
            div1 = document.createElement('div');
            div1.className = "imageBox";
            const img = document.createElement('img');
            img.src=objekt.img;
              img.style.width='150px';
            div1.appendChild(img);
            div.appendChild(div1);
              const rect = img.getBoundingClientRect();
              AddSVGobject(div, 150, 150, objekt.x, objekt.y, objekt.r);
          }
          else{
            div.textContent = `Co odpovídá: ${objekt.question}?`;
          }
          const input = document.createElement('div');
          input.className = 'drop-zone';
          input.dataset.correct = objekt.result.toLowerCase();
          input.imgBox = div1;
          input.addEventListener("dragover", handleDragOver);
          input.addEventListener("dragleave", handleDragLeave);
          input.addEventListener("drop", handleDrop);
          /*
          input.oninput = () => {
            if (input.value.toLowerCase() === input.dataset.correct) {
              input.style.backgroundColor = 'lightgreen';
              if(input.imgBox){
                input.imgBox.style.width="200px";
                input.imgBox.style.height="200px";
              }
              input.disabled = true;
              if (checkAllCorrect(container)) {
               nextRound();
               }
            } else {
              input.style.backgroundColor = '';
            }
          };
          */
          div.appendChild(input);
          container.appendChild(div);
        });
        if (round.options) {
            const options = Object.entries(round.options);
            const optionsBox = document.createElement('div');
            optionsBox.className='optionsBox';
            optionsBox.style.width = '100%';
            options.forEach((opt, i) => {
              const div2 = document.createElement('div');
              div2.className = 'drag-block';
              div2.textContent = opt[1];
              div2.setAttribute("draggable", "true");
              div2.addEventListener("dragstart", (event) => {
                event.dataTransfer.setData("text/plain", div2.textContent); // nebo jiný identifikátor
              });
              enableTouchDrag(div2);
              optionsBox.appendChild(div2);
            });
            container.appendChild(optionsBox);
        }
      }
      else if (round.type === 'puzzle') {
        const components = Object.entries(round.components);
        const componentsBox = document.createElement('div');
        componentsBox.className='drop-zone componentsBox';
        componentsBox.addEventListener("dragover", handleDragOver);
        componentsBox.addEventListener("dragleave", handleDragLeave);
        componentsBox.addEventListener("drop", handleDrop);
        componentsBox.style.width="100%";
        components.forEach((opt, i) => {
          const div2 = document.createElement('div');
          div2.id="puzzle"+opt[0];
          div2.nr=opt[0];
          div2.className = 'puzzle';
          div2.textContent = opt[1];
          div2.setAttribute("draggable", "true");
          div2.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain",div2.id); // nebo jiný identifikátor
          });
          enableTouchDrag(div2);
          componentsBox.appendChild(div2);
        });
        container.appendChild(componentsBox);
        const targetBox = document.createElement('div');
        targetBox.id="dropZone";
        targetBox.className='drop-zone targetBox';
        targetBox.style.width="100%";
        targetBox.addEventListener("dragover", handleDragOver);
        targetBox.addEventListener("dragleave", handleDragLeave);
        targetBox.addEventListener("drop", handleDrop);

        container.appendChild(targetBox);
      }
    }
    
    function handleDragLeave(event){
      const input = event.currentTarget;
      input.style.backgroundColor = "";
    }
    function handleDragOver(event){
      const input = event.currentTarget;
      event.preventDefault(); // Nutné pro umožnění dropu
      input.style.backgroundColor = clAllowDrop;
    }  
    function handleDrop(event){
        const input = event.currentTarget;
        event.preventDefault();
        input.style.backgroundColor = "";
      
        const data = event.dataTransfer.getData("text/plain"); // očekáváme text nebo ID
      
        // Pokusíme se najít prvek podle ID a vložit ho do divu
        const draggedElement = document.getElementById(data);
        if (draggedElement) {
          input.appendChild(draggedElement);
        } else {
          input.textContent = data; // fallback, pokud je to jen text
        }
        if((round.type === "puzzle")){
                const dropzone=document.getElementById("dropZone");
                const puzzlePrvky = dropzone.querySelectorAll('.puzzle');
                var result=true,i=0;
                puzzlePrvky.forEach(puzzle => {
                  result=result && (puzzle.nr == round.answer[i++]);
                });
                if(result && round.answer.length==puzzlePrvky.length){
                    dropzone.style.backgroundColor = "lightgreen";
                    nextRound();
                }
            }
        else{
          if (input.textContent.toLowerCase() === input.dataset.correct) {
            input.style.backgroundColor = 'lightgreen';
            if(input.imgBox){
              input.imgBox.style.width="200px";
              input.imgBox.style.height="200px";
            }
            input.disabled = true;
            input.removeEventListener("drop",handleDrop);
            input.removeEventListener("dragover", handleDragOver);
            input.removeEventListener("dragleave", handleDragLeave);
            if (checkAllCorrect(container)) {
             nextRound();
             }
          } else {
            input.style.backgroundColor = 'red';
            errors++;
          }
        }
      }

    function enableTouchDrag(el) {
      el.addEventListener("touchstart", function (e) {
        const touch = e.touches[0];
        const rect = el.getBoundingClientRect();
        draggedObject = el;
        el.dataset.offsetX = touch.clientX - rect.left;
        el.dataset.offsetY = touch.clientY - rect.top;
        document.body.appendChild(el);
        el.style.position = 'absolute';
        el.style.zIndex = 1000;
        el.classList.add("dragging");
      }
    );


    }
    function moveAt(el,x, y) {
      el.style.left = (x - el.dataset.offsetX) + 'px';
      el.style.top = (y - el.dataset.offsetY) + 'px';
    }
  
    function onTouchMove(e) {
        const touchMove = e.touches[0];
        moveAt(touchMove.target,touchMove.pageX, touchMove.pageY);
      }

      function onTouchEnd(e) {
        if(!draggedObject) return;
        draggedObject.classList.remove("dragging");
        draggedObject.style.position = '';
        draggedObject.style.left = '';
        draggedObject.style.top = '';
        draggedObject.style.zIndex = '';

        const touchEnd = e.changedTouches[0];
        const target = document.elementFromPoint(touchEnd.clientX, touchEnd.clientY);

        if (target && target.classList.contains("drop-zone")) {
        if((round.type === "puzzle")){
            target.appendChild(draggedObject);
                const puzzlePrvky = target.querySelectorAll('.puzzle');
                var result=true,i=0;
                puzzlePrvky.forEach(puzzle => {
                  result=result && (puzzle.nr == round.answer[i++]);
                });
                if(result && round.answer.length==puzzlePrvky.length){
                    target.style.backgroundColor = "lightgreen";
                    nextRound();
                }
         }
         else{ 
              target.innerHTML = '';
              if (draggedObject.textContent.toLowerCase() === target.dataset.correct) {
                target.style.backgroundColor = "lightgreen";
                target.appendChild(draggedObject);
                target.disabled = true;
              if (checkAllCorrect(container)) {
                 nextRound();
               }
              } else {
                target.style.backgroundColor = "red";
                errors++;
                document.querySelector('.optionsBox').appendChild(draggedObject);
              }
            }
        }
      }

    function AddSVGobject(object, pWidth, pHeight, pX, pY, pR){
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", pWidth);
        svg.setAttribute("height", pHeight);
        svg.setAttribute("viewBox", "0 0 200 200");
    
        // Vytvoření bílé vrstvy
        const whiteRect = document.createElementNS(svgNS, "rect");
        whiteRect.setAttribute("x", "0");
        whiteRect.setAttribute("y", "0");
        whiteRect.setAttribute("width", "200");
        whiteRect.setAttribute("height", "200");
        whiteRect.setAttribute("fill", "white");
    
        // Maska s průhledným kruhem
        const mask = document.createElementNS(svgNS, "mask");
        mask.setAttribute("id", "hole-mask");
    
        const maskRect = document.createElementNS(svgNS, "rect");
        maskRect.setAttribute("x", "0");
        maskRect.setAttribute("y", "0");
        maskRect.setAttribute("width", "200");
        maskRect.setAttribute("height", "200");
        maskRect.setAttribute("fill", "white"); // Neprůhledná oblast
    
        const maskCircle = document.createElementNS(svgNS, "circle");
        maskCircle.setAttribute("cx", pX);
        maskCircle.setAttribute("cy", pY);
        maskCircle.setAttribute("r", pR);
        maskCircle.setAttribute("fill", "black"); // Průhledná oblast
    
        mask.appendChild(maskRect);
        mask.appendChild(maskCircle);
        svg.appendChild(mask);
    
        // Použití masky na čtverec
        whiteRect.setAttribute("mask", "url(#hole-mask)");
    
        // Přidání prvků do SVG
        svg.appendChild(whiteRect);
    
        // Vložení SVG do dokumentu
        object.appendChild(svg);
    }
      function checkAllCorrect(container) {
      const inputs = container.querySelectorAll('input');
      const buttons = container.getElementsByClassName('rightAnswer');
      const zones = container.getElementsByClassName('drop-zone');
      return ( (round.type === 'match')?
                (([...inputs].length>0) ? 
                    [...inputs].every(input => input.disabled):
                     [...zones].every(input => input.disabled)
                ):
                [...buttons].every(btn => btn.style.backgroundColor === clColor)
            );
    }

    function nextRound() {
      currentRound++;
      if (currentRound < quizData.length) {
        setTimeout(startRound, 1000);
      } else {
        showResult();
      }
    }

    function showResult() {
      container.innerHTML = '<h2>Gratulujeme! Dokončili jste kvíz!</h2>';
      window.location.assign("https://apps.powerapps.com/play/e/b756c805-343b-401f-949b-1e2a061cfdb7/a/27f894a9-b173-41f0-8635-134e2f662331?tenantId=2882be50-2012-4d88-ac86-544124e120c8&hint=1d1b7cd9-fb2e-4a2c-a4a7-c6034324bd7a&sourcetime=1746183666343?mail=" + mail + "&kviz=" + kviz + "&errors=" + errors + "&seconds=" + seconds);
    }
    
    const params = new URLSearchParams(window.location.search);
    const jmeno = params.get("xname"); // "Tom"
    const kviz = params.get("xkviz");       // "123"
    const mail = params.get("xmail"); //
    const namePar = document.getElementById('namePar');
    namePar.textContent = jmeno;
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: false });
    
